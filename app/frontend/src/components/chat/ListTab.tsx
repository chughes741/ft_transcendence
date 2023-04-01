
import './ListTab.tsx.css'
import { Box, Typography, AppBar } from "@mui/material";
import { List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { MouseEvent, useState } from 'react';
import { UserType } from '../User';
import { AccountCircle } from '@material-ui/icons';


interface Props {
    users: UserType[];
    heading: string;
    onSelectItem: (user: UserType) => void
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
                height : '100%',
                position: 'fixed',
                right: '0',
            }}>
                <Box sx={{ height: '18px' }}></Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>

                    <Box className="list-title">{heading}</Box>

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
                                    <img src="/home/agrenon/projets/ft_transcendence/app/src/42Logo.jpg" />
                                </ListItemIcon>
                                <ListItemText primary={users.nick} secondary = {users.email} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Box>
        </>
    )
}

/* //To Put instead of list item
<List className="list-tab">
                        {users.map((users, index) => (
<li 
className={SelectedIndex === index ? 'list-group-active' : 'list-group-inactive'}
key={users.uuid} //don't forget to add user.id unique key
onClick={() => {
    setSelectedIndex(index);
    onSelectItem(users)
}}
> {users.nick}
</li>*/

export default ListTabulation;