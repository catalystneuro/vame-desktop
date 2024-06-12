import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pipeline from '../Pipeline';

import styled from 'styled-components';
import { onReady } from '../commoners';
import Tabs from '../components/Tabs';

import { CenteredFullscreenDiv } from '../components/divs';

import ProjectConfiguration from '../tabs/ProjectConfiguration';
import Organize from '../tabs/Organize';
import Model from '../tabs/Model';
import Segmentation from '../tabs/Segmentation';
import UMAPVisualization from '../tabs/UMAPVisualization';
import MotifVideos from '../tabs/MotifVideos';
import CommunityAnalysis from '../tabs/CommunityAnalysis';
import { post } from '../utils/requests';


const ProjectHeader = styled.header`
  padding: 20px 30px;
`

const ProjectInformation = styled.div`
  display: flex;
  gap: 15px;
  padding: 10px;

`;

const ProjectInformationCapsule = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  background: #f4f4f4;
  padding: 5px 10px;
  border-radius: 10px
`;



const Project: React.FC = () => {

  const [ searchParams ] = useSearchParams();

  const [ pipeline, setPipeline ] = useState();

  const [ selectedTab, setSelectedTab ] = useState();

  const projectPath = searchParams.get("project")

  // Load the pipeline configuration when the server is ready
  useEffect(() => {
    onReady(() => {
      const pipeline = new Pipeline(projectPath)
      pipeline.load().then(() => setPipeline(pipeline))
    })
    
   }, [])

   if (!pipeline) return <CenteredFullscreenDiv>
      <div>
        <b>Loading project details...</b>
        <br/>
        <small>{projectPath}</small>
      </div>
    </CenteredFullscreenDiv>


   const loadedPipeline = pipeline as Pipeline

   post('project/register', { project: loadedPipeline.path }) // Register project access


  const submitTab = async (
    callback,
    tab?: string
  ) => {

    const result = await callback()

    // Reload the pipeline
    const pipeline = new Pipeline(projectPath)
    await pipeline.load()
    setPipeline(pipeline)

    // Set the selected tab if provided
    if (tab) setSelectedTab(tab)

    return result

  }

  const { organized, modeled, segmented, motifs_created } = loadedPipeline.workflow

  const tabs = [
    {
      id: 'project-configuration',
      label: '1. Project Configuration',
      complete: organized,
      content: <ProjectConfiguration 
        pipeline={loadedPipeline} 
        onFormSubmit={async (formData) => submitTab(async () => {
          const { advanced_options, ...mainProperties } = formData
          await loadedPipeline.configure({...mainProperties, ...advanced_options})
        }, 'data-organization')}
      />
    },
    {
      id: 'data-organization',
      label: '2. Data Organization',
      complete: organized,
      content: <Organize 
        pipeline={loadedPipeline}
        onFormSubmit={async (params) => submitTab(async () => {
          const { check_parameter, ...alignmentParams } = params
          await loadedPipeline.align(alignmentParams)

          // Create the trainset
          await loadedPipeline.create_trainset({
            pose_ref_index: alignmentParams.pose_ref_index,
            check_parameter
          }) 

          // NOTE: Allow users to inspect the quality of the trainset here


        }, 'model-creation')}
      />,
    },
    {
      id: 'model-creation',
      label: '3. Model Creation',
      disabled: !organized,
      complete: modeled,
      content: <Model 
        pipeline={loadedPipeline}
        onFormSubmit={async ({ train, evaluate } = {
          train: true,
          evaluate: true
        }) => {
          const runAll = train && evaluate
          return submitTab(async () => {
            if (train) await loadedPipeline.train() // Train the model
            if (evaluate) await loadedPipeline.evaluate() // Evaluate the model
          }, runAll ? 'segmentation' : 'model-creation')
        }}
      />
    },

    {
      id: 'segmentation',
      label: '4. Pose Segmentation',
      disabled: !modeled,
      complete: segmented,
      content: <Segmentation 
        pipeline={loadedPipeline}
        onFormSubmit={async () => submitTab(async () => {
            await loadedPipeline.segment() // Run pose segmentation
          })}
      />
    },
    {
      id: 'motifs',
      label: '5. Motif Videos',
      disabled: !segmented,
      complete: motifs_created,
      content: <MotifVideos 
        pipeline={loadedPipeline}
        onFormSubmit={async () => submitTab(async () => {
            await loadedPipeline.motif_videos() // Create motif videos separately from pose segmentation
          })}
      />
    },
    {
      id: 'community',
      label: '6. Community Analysis',
      disabled: !segmented,
      content: <CommunityAnalysis 
        pipeline={loadedPipeline}
        onFormSubmit={async () => submitTab(async () => {
            await loadedPipeline.community() // Run community analysis
            await loadedPipeline.community_videos() // Creating community videos. NOTE: Will need additional consultation for how to proceed
          })}
      />
    },
    {
      id: 'umap',
      label: '7. UMAP Visualization',
      disabled: !segmented,
      content: <UMAPVisualization
        pipeline={loadedPipeline}
        onFormSubmit={async () => submitTab(async () => {
            await loadedPipeline.visualization() // Create visualization
          })}
      />
    },
  ];


   return (
    <div>
      <ProjectHeader>
        <h2>{loadedPipeline.configuration.Project}</h2>
        <ProjectInformation>
          <ProjectInformationCapsule><small><b>Creation Date</b> <small>{loadedPipeline.creationDate.toLocaleDateString()}</small></small></ProjectInformationCapsule>
          <ProjectInformationCapsule><small><b>Project Location</b> <small>{loadedPipeline.configuration.project_path}</small></small></ProjectInformationCapsule>
        </ProjectInformation>
      </ProjectHeader>
      <Tabs 
        tabs={tabs} 
        selected={selectedTab}
      />

    </div>
  );
};

export default Project;
