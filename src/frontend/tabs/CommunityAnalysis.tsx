import DynamicForm from "../components/DynamicForm"
import { PaddedTab} from "../components/elements"

import communitySchema from '../../schema/community.schema.json'
import { TabProps } from "./types"
import TerminalModal from "../components/TerminalModal"
import { useState } from "react"

const CommunityAnalysis = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {
    const [terminal, setTerminal] = useState(false)

    const schema = structuredClone(communitySchema)

    const communitiesCreated = pipeline.workflow.communities_created

    if (communitiesCreated) {
        Object.values(schema.properties).forEach(v => v.readOnly = true)
    }

    return (
        <PaddedTab>
            <button onClick={()=>setTerminal(true)}>Open logs</button>

            <TerminalModal projectPath={pipeline.path} logName={["community"]} isOpen={terminal} onClose={()=>setTerminal(false)}/> 

            <DynamicForm 
                initialValues={{}} 
                schema={schema}
                blockSubmission={block}
                submitText={"Create Communities"}
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )

}

export default CommunityAnalysis