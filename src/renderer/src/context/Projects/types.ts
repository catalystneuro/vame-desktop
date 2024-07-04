import configureVAMEProject from "./configureVAMEProject"
import createVAMEProject from "./createVAMEProject"
import deleteVAMEProject from "./deleteProject"

export type Project = {
  project: string;
  config: {
    Project: string;
    project_path: string;
    all_data: boolean;
    anneal_function: string;
    annealtime: number;
    axis: string;
    batch_size: number;
    beta: number;
    beta_norm: boolean;
    dropout_encoder: number;
    dropout_pred: number;
    dropout_rec: number;
    egocentric_data: boolean;
    hidden_size_layer_1: number;
    hidden_size_layer_2: number;
    hidden_size_pred: number;
    hidden_size_rec: number;
    hmm_trained: boolean;
    individual_parametrization: boolean;
    iqr_factor: number;
    kl_start: number;
    kmeans_lambda: number;
    kmeans_loss: number;
    learning_rate: number;
    legacy: boolean;
    length_of_motif_video: number;
    load_data: string;
    max_epochs: number;
    min_dist: number;
    model_convergence: number;
    model_name: string;
    model_snapshot: number;
    mse_prediction_reduction: string;
    mse_reconstruction_reduction: string;
    n_cluster: number;
    n_init_kmeans: number;
    n_layers: number;
    n_neighbors: number;
    noise: boolean;
    num_features: number;
    num_points: number;
    parametrization: string;
    pose_confidence: number;
    prediction_decoder: number;
    prediction_steps: number;
    pretrained_model: string;
    pretrained_weights: boolean;
    random_state: number;
    random_state_kmeans: number;
    robust: boolean;
    savgol_filter: boolean;
    savgol_length: number;
    savgol_order: number;
    scheduler: number;
    scheduler_gamma: number;
    scheduler_step_size: number;
    scheduler_threshold: number | null;
    softplus: boolean;
    test_fraction: number;
    time_window: number;
    transition_function: string;
    video_sets: string[];
    zdims: number;
  };
  workflow: {
    communities_created: boolean;
    community_videos_created: boolean;
    modeled: boolean;
    motif_videos_created: boolean;
    organized: boolean;
    pose_ref_index_description: string;
    segmented: boolean;
    umaps_created: boolean;
  };
  states: {
    community: Record<string, unknown>;
    community_videos: Record<string, unknown>;
    create_trainset: {
      check_parameter: boolean;
      config: string;
      execution_state: string;
      pose_ref_index: number[];
    };
    csv_to_numpy: Record<string, unknown>;
    egocentric_alignment: {
      check_video: boolean;
      config: string;
      crop_size: number[];
      execution_state: string;
      pose_ref_index: number[];
      use_video: boolean;
      video_format: string;
    };
    evaluate_model: Record<string, unknown>;
    generative_model: Record<string, unknown>;
    motif_videos: Record<string, unknown>;
    pose_segmentation: Record<string, unknown>;
    train_model: {
      config: string;
      execution_state: string;
    };
    visualization: Record<string, unknown>;
  };
  videos: string[];
  csvs: string[];
  assets: {
    images: {
      evaluation: unknown[];
      visualization: Record<string,unknown[]>;
    };
    videos: {
      community: Record<string,unknown[]>;
      motif: Record<string,unknown[]>;
    };
  };
};

export type IProjectContext = {
  projects: Project[]
  refresh: () => Promise<void>

  createProject: typeof createVAMEProject
  configureProject: typeof configureVAMEProject
  deleteProject: typeof deleteVAMEProject
}