import React from 'react';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import './PlaceItem.css';
import {useState, useEffect, useContext} from 'react';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
const PlaceItem = (props) =>{
    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const auth=useContext(AuthContext);
    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setShowConfirmModal]=useState(false);
    const openMap = () => {
        setShowMap(true);
    }
    const closeMap = () => {
        setShowMap(false);
    }

    const showDeletWarning = () => {
        setShowConfirmModal(true);
    }

    const cancelDeleteWarning =() =>{
        setShowConfirmModal(false);
    }

    const confirmDelete = async ()=>{
        setShowConfirmModal(false);
        try{
            await sendRequest(`http://localhost:5000/api/places/${props.id}`,
            'DELETE',
            null,
            {
                Authorization: 'Bearer' + auth.token
            }
            );
            props.onDelete(props.id);
        }catch(err)
        {

        }
    }

    return(
        <React.Fragment>
            <ErrorModal error={error} onClear ={clearError}/>
            <Modal show={showMap} onCancel={closeMap}
            header={props.address} 
            contentClass="place-item__modal-content"
            footerClass="place-item__modal-actions"
            footer={<Button onClick={closeMap}>CLOSE</Button>}>
            <div className="map-container">
                <Map center={props.coordinates}
                zoom={16}
                />
            </div>
            </Modal>
            <Modal
            show={showConfirmModal}
            onCancel={cancelDeleteWarning} 
            header="Are you sure?"
            footerClass="place-item__modal-actions"
            footer={
                <React.Fragment>
                    <Button inverse onClick={cancelDeleteWarning}>CANCEL</Button>
                    <Button danger onClick={confirmDelete}>DELETE</Button>
                </React.Fragment>
            }>
                <p>Do you want to proceed ?</p>
            </Modal>    
            <li className="place-item">
            <Card className="place-item__content">
                {isLoading && <LoadingSpinner asOverlay/>}
            <div className="place-item__image">
                <img scr={`http://localhost:5000/${props.image}`} alt={props.title}/>
            </div>
            <div className="place-item__info">
                <h2>{props.title}</h2>
                <h3>{props.address}</h3>
                <p>{props.description}</p>
            </div>
            <div className="place-item__actions">
                <Button inverse onClick={openMap}>VIEW ON MAP</Button>
                {auth.userId===props.creatorId&&<Button to={`/places/${props.id}`}>EDIT</Button>}
                {auth.userId===props.creatorId&&<Button danger onClick={showDeletWarning}>DELETE</Button>}
            </div>
            </Card>
            </li>
        </React.Fragment>
    );
    
}

export default PlaceItem;