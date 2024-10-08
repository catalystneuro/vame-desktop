import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { open } from '@renderer/utils/folders';
import { post } from '@renderer/utils/requests';
import { onConnected, onProjectReady } from '@renderer/utils/vame';

import { useProjects } from '@renderer/context/Projects';

import Tabs from '@renderer/components/Tabs';
import Header from '@renderer/components/Header';
import { Container, HeaderButton, HeaderButtonContainer, ProjectHeader, ProjectInformation, ProjectInformationCapsule } from './styles';

import ProjectConfiguration from './Tabs/ProjectConfiguration';
import Organize from './Tabs/Organize';
import Model from './Tabs/Model';
import Segmentation from './Tabs/Segmentation';
import MotifVideos from './Tabs/MotifVideos';
import { CommunityAnalysis } from './Tabs/CommunityAnalysis';
import CommunityVideos from './Tabs/CommunityVideos';
import UMAPVisualization from './Tabs/UMAPVisualization';
import { MainContainer } from '@renderer/components/Container';
import { useSettings } from '@renderer/context/Settings';

const Project: React.FC = () => {

  const [searchParams] = useSearchParams();
  const projectPath = searchParams.get("path")
  const {
    getProject,
    refresh,
    configureProject,
    align,
    createTrainset,
    train,
    evaluate,
    segment,
    communityAnalysis,
    createCommunityVideos,
    createMotifVideos,
    createUMAPVisualization,
  } = useProjects()

  const {
    tabsLock
  } = useSettings()

  const [project, setProject] = useState<Project | undefined>()
  const [blockSubmit, setBlockSubmit] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("project-configuration");

  const navigate = useNavigate()

  const submitTab = useCallback(async (
    callback: () => Promise<void>,
    tab?: string
  ) => {
    try {
      setBlockSubmit(true)
      await callback()
      await refresh()

      if (tab) {
        const localItem = `selected-tab-${project?.config.Project}`
        localStorage.setItem(localItem, tab)
        setSelectedTab(tab)
      }
    } catch (e) {
      console.log
    } finally {
      setBlockSubmit(false)
    }
  }, [project])


  useEffect(() => {
    if (projectPath) {
      onConnected(async () => {
        post('project/register', { project: projectPath }).then(res => {
          if (res.success)
            setProject(getProject(projectPath))
        })
      })

      onProjectReady(projectPath, () => setBlockSubmit(false))
    }
  }, [projectPath])

  useEffect(()=>{
    if(project){
      const loadedTab = localStorage.getItem(`selected-tab-${project?.config.Project}`)
      if(loadedTab){
        setSelectedTab(loadedTab)
      }
    }
  },[project])

  if (!project) {
    return (
      <MainContainer>
        <div>
          <b>Loading project details...</b>
          <br />
          <small>{projectPath}</small>
        </div>
      </MainContainer>
    );
  }

  const {
    egocentric_alignment,
    create_trainset,
    evaluate_model,
    train_model,
    pose_segmentation,
    motif_videos,
    community,
    community_videos,
    visualization,
  } = project.states

  const organized = egocentric_alignment.execution_state==="success" && create_trainset.execution_state==="success"

  const modeled = evaluate_model.execution_state==="success" && train_model.execution_state==="success"

  const segmented = pose_segmentation.execution_state==="success"

  const motif_videos_created = motif_videos.execution_state==="success" && project.workflow.motif_videos_created

  const community_videos_created = community_videos.execution_state==="success" && project.workflow.community_videos_created

  const umaps_created = visualization.execution_state==="success" && project.workflow.umaps_created


  const tabs = [
    {
      id: 'project-configuration',
      label: '1. Project Configuration',
      complete: organized,
      content: <ProjectConfiguration
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={async (formData) => submitTab(async () => {
          const { advanced_options, ...mainProperties } = formData as any

          await configureProject(
            {
              config: { ...mainProperties, ...advanced_options }, project: project.config.project_path
            }).catch(e => alert(e))

        }, 'data-organization')}
      />
    },
    {
      id: 'data-organization',
      label: '2. Data Organization',
      complete: organized,
      content: <Organize
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={async (params) => submitTab(async () => {

          const { pose_ref_index, advanced_options } = params as any

          pose_ref_index.description = `${pose_ref_index.description}. `

          await align({ project: project.config.project_path, pose_ref_index, ...advanced_options })

          await createTrainset({ project: project.config.project_path, pose_ref_index })

          // TODO: Allow users to inspect the quality of the trainset here

        }, 'model-creation')}
      />,
    },
    {
      id: 'model-creation',
      label: '3. Model Creation',
      disabled: tabsLock && !organized,
      complete: modeled,
      tooltip: "Organize your project first.",
      content: <Model
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={({ train: needTrain, evaluate: needEvaluate }: any) => {
          const runAll = needTrain && needEvaluate
          return submitTab(async () => {
            const projectPath = project.config.project_path

            if (needTrain) await train({ project: projectPath })
            if (needEvaluate) await evaluate({ project: projectPath })

          }, runAll ? 'segmentation' : 'model-creation')
        }}
      />
    },
    {
      id: 'segmentation',
      label: '4. Pose Segmentation',
      disabled: tabsLock && !modeled,
      complete: segmented,
      tooltip: "Model your project first.",
      content: <Segmentation
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={() => submitTab(async () => {
          const projectPath = project.config.project_path
          await segment({ project: projectPath })
        }, 'segmentation')}
      />
    },
    {
      id: 'motifs-videos',
      label: '5. Motif Videos',
      disabled: tabsLock && !segmented,
      complete: motif_videos_created,
      tooltip: "Need Pose Segmentation.",
      content: <MotifVideos
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={(data) => submitTab(async () => {
          const projectPath = project.config.project_path
          await createMotifVideos({
            project: projectPath,
            ...data,
          })
        }, "motifs-videos")}
      />
    },
    {
      id: 'community-analysis',
      label: '6a. Community Analysis',
      disabled: tabsLock && !segmented,
      complete: community?.execution_state === "success",
      tooltip: "Need Pose Segmentation.",
      content: <CommunityAnalysis
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={(data: any) => submitTab(async () => {
          const projectPath = project.config.project_path

          await communityAnalysis({
            project: projectPath,
            cohort: data.cohort,
            cut_tree: data.cut_tree,
            show_umap: data.show_umap,
            parametrization: data.parametrization,
          })
        }, "community-videos")}
      />
    },
    {
      id: 'community-videos',
      label: '6b. Community Videos',
      disabled: tabsLock && (!!community.cohort || community?.execution_state !== "success"),
      complete: community_videos_created,
      tooltip: "Need community analysis with cohort false.",
      content: <CommunityVideos
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={(data: any) => submitTab(async () => {
          const projectPath = project.config.project_path
          await createCommunityVideos({
            project: projectPath,
            parametrization: data.parametrization, 
          })
        }, "community-videos")}
      />
    },
    {
      id: 'umap-visualization',
      label: '7. UMAP Visualization',
      complete: umaps_created,
      disabled: tabsLock && !segmented,
      tooltip: "Need segmentation.",
      content: <UMAPVisualization
        project={project}
        blockSubmission={blockSubmit}
        blockTooltip="Waiting VAME to be ready."
        onFormSubmit={(data) => submitTab(async () => {
          const projectPath = project.config.project_path
          await createUMAPVisualization({
            project: projectPath,
            ...data
          })
        }, "umap-visualization")}
      />
    },

  ]

  return (
    <Container>
      <ProjectHeader>
        <Header title={project.config.Project}>
          <HeaderButtonContainer>
            <HeaderButton onClick={() => {
              open(project.config.project_path)

            }}>Open in File Explorer</HeaderButton>
            <HeaderButton onClick={() => {
              navigate({
                pathname: '/create',
                search: `?project=${project.config.project_path}`
              })
            }}>Restart Project</HeaderButton>
          </HeaderButtonContainer>
        </Header>
        <ProjectInformation>
          <ProjectInformationCapsule>
            <small>
              <b>Creation Date</b>
              <small>
                {project.created_at}
              </small>
            </small></ProjectInformationCapsule>
          <ProjectInformationCapsule>
            <small>
              <b>Project Location</b>
              <small>
                {project.config.project_path}
              </small>
            </small>
          </ProjectInformationCapsule>
        </ProjectInformation>
      </ProjectHeader>
      <Tabs
        tabs={tabs}
        selected={selectedTab}
      />
    </Container>
  );
};

export default Project;
