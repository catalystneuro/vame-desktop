import styled from "styled-components"
import { TabProps } from "./types"
import { header } from "../../../utils/text"
import TerminalModal from "../../../components/TerminalModal"
import { useMemo, useState } from "react"
import { PaddedTab } from "@renderer/components/Tabs/styles"
import { Button } from "@renderer/components/DynamicForm/styles"
import { ControlButton } from "@renderer/pages/Home/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import { useProjects } from "@renderer/context/Projects"
import Tippy from "@tippyjs/react"

const FlexGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
`

const ImageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
        height: 300px;
        width: auto;
    }
`

const UMAPVisualization = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip,
}: TabProps) => {
  const hasUmaps = project.workflow.umaps_created
  const [terminal, setTerminal] = useState(false)

  const { getAssetsPath } = useProjects()

  const images = useMemo(() => {
    return Object.entries(project.assets.images.visualization).map(([video_set, images]) => (
      images.map((umapPath) => {
        const label = umapPath.split('umap_vis_label_')[1].split(`_${video_set}`)[0]
        const uniqueKey = `${video_set}_${label}`

        return (
          <ImageContainer>
            <img src={getAssetsPath(project.config.project_path, umapPath)} alt={uniqueKey} key={uniqueKey} />
            <small><b>{video_set}:</b> {header(label)}</small>
          </ImageContainer>
        )
      })
    )).flat(1);
  }, [project])

  if (hasUmaps) {
    return (
      <>
        <ControlButton onClick={() => setTerminal(true)}>
          <FontAwesomeIcon icon={faTerminal} />
        </ControlButton>

        <TerminalModal projectPath={project.config.project_path} logName={["visualization"]} isOpen={terminal} onClose={() => setTerminal(false)} />

        <FlexGrid>
          {images}
        </FlexGrid>
      </>
    )
  }


  return (
    <PaddedTab>
      <Tippy
        content={blockTooltip}
        placement="bottom"
        hideOnClick={false}
        onShow={() => !blockSubmission as false}
      >
        <span>
          <Button
            disabled={blockSubmission}
            onClick={() => onFormSubmit({ evaluate: true })}
          >
            Create UMAP Visualization
          </Button>
        </span>
      </Tippy>
    </PaddedTab>
  )
}

export default UMAPVisualization