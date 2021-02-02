import React, {useState, useContext} from 'react';
import Button from '../../shared/components/FormElements/Button';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import Input from '../../shared/components/FormElements/Input';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import './Auth.css';
const Auth =() => {
    const auth = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const {isLoading,error, sendRequest, clearError}=useHttpClient();
    const[formState, inputHandler, setFormData]=useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false);

    const submitHandler = async e =>{
        e.preventDefault();

        if(isLogin){
            try{
                
                const responseData = await sendRequest('http://localhost:5000/api/users/login', 
                    'POST', 
                    JSON.stringify({
                    email: formState.inputs.email.value,
                    password: formState.inputs.password.value
                    }),
                    {
                        'Content-Type': 'application/json'
                    }
                )
        
        auth.login(responseData.userId, responseData.token);
        } catch(err){
            console.log(err);
        }
        }
        else{
            try{
                const formData = new FormData();
                formData.append('email',formState.inputs.email.value );
                formData.append('password',formState.inputs.password.value );
                formData.append('name',formState.inputs.name.value );
                formData.append('image', formState.inputs.image.value);
                const responseData = await sendRequest('http://localhost:5000/api/users/signup',
                'POST',
                formData
            );

        auth.login(responseData.userId, responseData.token);
        } catch(err){
            console.log(err);
            
        }
            
        }
    };

    const switchModeHandler = () => {
        if(!isLogin){
            setFormData({
                ...formState.inputs,
                name: undefined,
                image: undefined   
            }, formState.inputs.email.isValid&&formState.inputs.password.isValid
            )
        }
        else{
            setFormData({
                ...formState.inputs,
                name: {
                value: '' ,
                isValid: false
            },
            image: {
                value: null,
                isValid: false
            }
        }, false)
        }
        setIsLogin(prevMode => !prevMode);
    }

    return(
        <React.Fragment>
        <ErrorModal error={error} onClear={clearError}/>
        <Card className="authentication">
            {isLoading &&<LoadingSpinner asOverlay/>}
            <h2>LOGIN</h2>
            <hr />
            <form onSubmit={submitHandler}>
                {!isLogin && <Input 
                                    id="name"
                                    elemenet="input"
                                    type="text"
                                    label="NAME"
                                    validators={[VALIDATOR_REQUIRE()]}
                                    errorText="Enter name !!"
                                    onInput={inputHandler}/>}
                {!isLogin && 
                <ImageUpload center 
                id="image"
                onInput={inputHandler}
                />
                }
                <Input 
                id="email"
                element="input"
                type="email"
                label="EMAIL"
                validators={[VALIDATOR_EMAIL()]}
                errorText="Enter valid Email address"
                onInput={inputHandler}/>
                <Input 
                id="password"
                element="input"
                type="password"
                label="PASSWORD"
                validators={[VALIDATOR_MINLENGTH(6)]}
                errorText="Wrong Password"
                onInput={inputHandler}/>
                <Button type="submit" disabled={!formState.isValid}>
                    {isLogin ? 'LOGIN' : 'SIGN-UP'}
                    </Button>
            </form>
            <Button inverse onClick={switchModeHandler}>
                Switch to {isLogin ? 'SIGNUP' : 'LOGIN'}
                </Button>
        </Card>
        </React.Fragment>
    );
}

export default Auth;