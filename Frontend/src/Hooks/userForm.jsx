import { useState } from "react"

function useForm (initialState){

    const [formState, setFormState] = useState(initialState)

    function handleChangeInput (event){
        const input = event.target
        const fieldName = input.name
        const fieldValue = input.value

        setFormState(
            (prevState) => {
                return {...prevState, [fieldName]: fieldValue}
            }
        )
    }

    return {
        formState, 
        handleChangeInput
    }
}

export default useForm