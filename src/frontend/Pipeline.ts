import { baseUrl, get, post } from "./utils/requests";

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> | boolean : T[P];
};

type PipelineInputs = {
    name: string,
    videos: string[],
    csvs: string[],
    videotype: string,
    [key: string]: any // Global default properties
}

type PipelineConfiguration = {
    egocentric_data?: boolean,
    max_epochs?: number
}

type BasePipelineMethodOptions = {
    align: {
        pose_ref_index: number[],
        egocentric_data: boolean
    },
    create_trainset: {
        check_parameter: boolean,
        pose_ref_index: number[],
    },
    train: {},
    evaluate: {},
    segment: {},
    motif_videos: {
        videoType: string
    },
    community: {
        show_umap: boolean,
        cut_tree: number
    },
    community_videos: {},
    visualization: {
        label: string | null
    },
    generative_model: {
        mode: string
    },
    gif: {
        pose_ref_index: number[],
        subtract_background: boolean,
        start: number | null,
        length: number,
        max_lag: number,
        label: string,
        file_format: string,
        crop_size: number[]
    },
}

export  type PipelineMethodOptions = DeepPartial<BasePipelineMethodOptions>

class Pipeline {

    // For Functions
    configuration: PipelineConfiguration = {}

    #path: string = '';

    #defaults: Record<string, any> = {
        pose_ref_index: [ 0, 5 ]
    }

    assets = {
        images: {
            evaluation: [],
            visualization: []
        },
        videos: {
            community: {},
            motif: {}
        }
    }

    constructor(absPath?: string) {
        this.path = absPath ?? ''
    }

    set path(path: string) {
        const filename = path.split('/').pop()
        if (filename === 'config.yaml') path = path.replace('/config.yaml', '') // Remove config.yaml from path
        this.#path = path
    }

    get path() {
        return this.#path
    }

    get creationDate() {
        if (!this.configuration) return null

        const { Project, project_path } = this.configuration
        const pipelineCreationDateString = project_path.split(`${Project}-`)[1]
        return new Date(pipelineCreationDateString)
    }

    // Load the pipeline information
    load = async () => {
        const result = await post('load', { project: this.path })
        this.configuration = result.config
        this.assets = {
            images: result.images,
            videos: result.videos
        }

        return result
    }

    create = async (props: PipelineInputs) => {

        const propsCopy = { ...props }

        const { name, videos, csvs, videotype, ...globalDefaults } = propsCopy

        const result = await post('create', {
            project: name,
            videos: videos,
            poses_estimations: csvs,
            videotype: videotype,
        }) as {
            config: PipelineConfiguration,
            project: string
        }

        Object.assign(this.#defaults, globalDefaults)

        this.configuration = result.config

        this.#path = result.project

        return result
    }

    configure = async (configUpdate: Record<string, any> = {}) => {
        const result = await post('configure', { project: this.path, config: configUpdate }) as { config: PipelineConfiguration }
        return this.configuration = result.config
    }

    delete = () => {
        return post('delete_project', { project: this.path })
    }

    align = (options?: PipelineMethodOptions["align"]) => this.#request('align', options, { pose_ref_index: this.#defaults.pose_ref_index, egocentric_data: this.configuration.egocentric_data})

    create_trainset = (options?: PipelineMethodOptions["create_trainset"]) => this.#request('create_trainset', options)

    train = (options?: PipelineMethodOptions["train"]) => this.#request('train', options)

    evaluate = (options?: PipelineMethodOptions["evaluate"]) => this.#request('evaluate', options)

    segment = (options?: PipelineMethodOptions["segment"]) => this.#request('segment', options)

    #request = async (
        endpoint: string,
        options?: Record<string, any> | boolean | null,
        defaultOptions?: Record<string, any>
    ) => {

        if (options === null) return

        if (typeof options === 'boolean') {
            if (!options) return
            options = {}
        }

        return post(endpoint, {
            ...defaultOptions,
            ...options,
            project: this.path,

        })
    }

    motif_videos = (options?: PipelineMethodOptions["motif_videos"]) => this.#request('motif_videos', options) //, { videoType: `.${this.videotype}` })
    community = (options?: PipelineMethodOptions["community"]) => this.#request('community', options)
    community_videos = (options?: PipelineMethodOptions["community_videos"]) => this.#request('community_videos', options)
    visualization = (options?: PipelineMethodOptions["visualization"]) => this.#request('visualization', options)
    generative_model = (options?: PipelineMethodOptions["generative_model"]) => this.#request('generative_model', options)
    gif = (options?: PipelineMethodOptions["gif"]) => this.#request('gif', options, { pose_ref_index: this.#defaults.pose_ref_index })


    exists = (path) => get(this.getAssetPath(path, 'exists'))
    
    getAsset = (path) => get(this.getAssetPath(path))

    getAssetPath = (path: string, basePath = 'files') => {
        const { Project, project_path } = this.configuration
        const fullProjectDirectory = `${Project}${project_path.split(Project).slice(1).join(Project)}`
        return new URL(`${basePath}/${fullProjectDirectory}/${path}`, baseUrl).href
    }
}

export default Pipeline