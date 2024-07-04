import { post } from "@renderer/utils/requests"
import { Project } from "./types"

export interface CreateProps {
  name: string
  videos: string[] 
  csvs : string[]
}

export interface CreateResponse {
  config: Project["config"]
  created: boolean
  project: string
}

const createVAMEProject = async ({ name, videos, csvs }: CreateProps) => {
    const result = await post<CreateResponse>('create', {
      project: name,
      videos: videos,
      poses_estimations: csvs,
    })

    if(result.success){
      return result.data
    } else {
      throw new Error(result.error)
    }
}

export default createVAMEProject