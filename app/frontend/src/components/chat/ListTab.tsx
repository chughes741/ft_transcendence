
import './ListTab.tsx.css'
import { Box } from "@mui/material";
import { MouseEvent, useState } from 'react';
import {UserType} from '../User';

interface Props{
    users : UserType[];
    heading: string;
    onSelectItem: (user : UserType) => void
}   

function ListTabulation( {users , heading, onSelectItem} : Props) {

    const items = [
        'Mario',
        'Paris',
        'Anne_putride',
    ];
    
    //State hook: means that this function will have variable that will change over time.
    //if the change of our function is updated, React will automatically update the DOM for us
    const [SelectedIndex, setSelectedIndex] = useState(-1);// Variable (SelectedIndex) and updater function
    // const [name, setName ] = useState(''); this could be use to modify also the state of the name

    return (
        <>
            <div style={{
                position: 'fixed',
                top: '50%',
                right: '0',
                transform: 'translateY(-50%)'
            }}>
                <Box sx={{height: '65px'}}></Box>
                <Box border={2} borderColor="black" p={2} display="inline-block">
                    
                    <div className="list-title">{heading}</div>
                    
                    {users.length === 0 && <div>No one in chat </div> } 
                    
                    <ul className="list-tab">
                        {users.map( (users, index) => (
                            <li 
                            className = {SelectedIndex === index ? 'list-group-active' : 'list-group-inactive' }
                            key = {users.uuid} //don't forget to add user.id unique key
                            onClick = { () => {
                                setSelectedIndex(index);
                                onSelectItem(users)
                            }}
                            > {users.nick}  
                            </li> 
                        ))}
                    </ul>
                </Box>
            </div>
        </>
    )
}

export default ListTabulation;