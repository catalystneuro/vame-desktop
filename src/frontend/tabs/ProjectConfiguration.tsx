import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import projectConfigSchema from '../../schema/config.schema.json'
import Pipeline from "../Pipeline"


const ProjectConfiguration = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {
    return (
        <DynamicForm 
            initialValues={pipeline.configuration} 
            schema={projectConfigSchema}
            submitText="Save Configuration"
            onFormSubmit={onFormSubmit} 
        />
    )
}

export default ProjectConfiguration