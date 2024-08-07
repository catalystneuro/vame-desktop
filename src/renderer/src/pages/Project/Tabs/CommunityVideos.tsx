import { useState } from "react"
import TerminalModal from "../../../components/TerminalModal"
import { VideoGrid, VideoType } from "../../../components/VideoGrid"
import { TabProps } from "./types"
import { Button } from "@renderer/components/DynamicForm/styles"
import { PaddedTab } from "@renderer/components/Tabs/styles"
import Tippy from "@tippyjs/react"
import { ControlButton } from "@renderer/pages/Home/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"

import CommunityVideosSchema from "../../../../../schema/community-videos.schema.json"
import DynamicForm from "@renderer/components/DynamicForm"

const CommunityVideos = ({
  project,
  onFormSubmit,
  blockSubmission,
  blockTooltip,
}: TabProps) => {
  const [terminal, setTerminal] = useState(false)

  const schema = structuredClone(CommunityVideosSchema) as unknown as Schema

  const { videos } = project.assets

  const communityVideos = videos?.community ?? {}

  const organizedVideos = Object.entries(communityVideos).reduce((acc, [label, videosObj]) => {
    Object.entries(videosObj).forEach(([parametrization, videos]) => {

      acc[`${label}-${parametrization}`] = videos.map((videoPath: string) => {
        const number = videoPath.split('-').pop()?.split('_').pop()?.split('.')[0]
        return { path: videoPath, label: `Community ${number}`, idx: Number(number) }
      }).sort((a, b) => a.idx - b.idx)
    })

    return acc
  }, {} as Record<string, VideoType[]>)


  return <PaddedTab>
    <span>
      Open logs:{" "}
      <ControlButton onClick={() => setTerminal(true)}>
        <FontAwesomeIcon icon={faTerminal} />
      </ControlButton>
    </span>

    <Tippy
      content={blockTooltip}
      placement="bottom"
      hideOnClick={false}
      disabled={!blockSubmission}
    >
      <span>
        <DynamicForm
          schema={schema}
          blockSubmission={blockSubmission}
          submitText={"Create Community Videos"}
          onFormSubmit={onFormSubmit}
        />
      </span>
    </Tippy>

    <TerminalModal
      projectPath={project.config.project_path}
      logName={["community_videos"]}
      isOpen={terminal}
      onClose={() => setTerminal(false)}
    />
    <VideoGrid
      videos={organizedVideos}
      project={project}
    />
  </PaddedTab>
}

export default CommunityVideos