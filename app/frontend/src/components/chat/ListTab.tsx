
import './ListTab.tsx.css'
import { Box, Typography, AppBar } from "@mui/material";
import { List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { MouseEvent, useState, useEffect } from 'react';
import { myUsers } from './UserList';
import GroupIcon from "@mui/icons-material/Group";


interface Props {
    users: myUsers[];
    heading: string;
    onSelectItem: (user: myUsers) => void
}

function ListTabulation({ users, heading, onSelectItem }: Props) {

    //State hook: means that this function will have variable that will change over time.
    //if the change of our function is updated, React will automatically update the DOM for us
    //const [SelectedIndex, setSelectedIndex] = useState(-1);// Variable (SelectedIndex) and updater function
    // const [name, setName ] = useState(''); this could be use to modify also the state of the name

    const [SelectedIndex, setSelectedIndex] = useState(-1);

    return (
        <>
            <Box style={{
                height: '100%',
                position: 'fixed',
                right: '0',
                marginTop: '64px'
            }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>

                    <Box className="list-title">
                        <ListItemIcon>
                            <GroupIcon color='secondary' />
                        </ListItemIcon>
                        {heading}

                    </Box>

                    {users.length === 0 && <Box>No one in chat </Box>}

                    <List>
                        {users.map((users, index) => (
                            <ListItemButton
                                selected={SelectedIndex === index ? true : false}
                                key={users.uuid} //don't forget to add user.id unique key
                                onClick={() => {
                                    setSelectedIndex(index)
                                    onSelectItem(users)
                                }}
                            >
                                <ListItemIcon>
                                    <img src= {`https://i.pravatar.cc/150?u=${users.uuid}`} />
                                </ListItemIcon>
                                <ListItemText primary={users.nick} secondary={users.email} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Box>
        </>
    )
}

export default ListTabulation;