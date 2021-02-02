import React, {useCallback, useReducer} from 'react';

const formReducer = (state, action) => {
    switch(action.type){
        default:
            return state
        case 'INPUTCHANGE':
            let formIsValid = true;
            for(const inputId in state.inputs){
                if(!state.inputs[inputId])
                {
                    continue;
                }
                if(inputId===action.inputId)
                {
                    formIsValid = formIsValid && action.isValid;
                }
                else{
                    formIsValid = formIsValid && state.inputs[inputId].isValid;
                }
            }
            return {
                ...state,
                inputs: {
                    ...state.inputs,
                    [action.inputId]: {value: action.value, isValid: action.isValid}
                },
                isValid: formIsValid
            }
        case 'SET_DATA':
            return{
                inputs: action.inputs,
                isValid: action.formIsValid
            };
    }
}

export const useForm = (initialInputs, initialFormValidity) =>{
    const [formState,dispatch]=useReducer(formReducer, {
        inputs: initialInputs, 
        isValid: initialFormValidity
    });

    const inputHandler = useCallback((id, value, isValid) => {
        dispatch({
            type: 'INPUTCHANGE', 
            value: value, 
            isValid: isValid, 
            inputId: id
           });
   },[]);

   const setFormData = useCallback((inputData, formValidity)=>{
       dispatch({
           type: 'SET_DATA',
           inputs: inputData,
           formIsValid: formValidity
       });
   },[]);

   return[formState, inputHandler, setFormData]
}
