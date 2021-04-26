import React, { useCallback, useEffect, useState } from 'react'
/* Hooks React > 16.8: https://reactjs.org/docs/hooks-effect.html
 * - Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.
 * The Effect Hook lets you perform side effects in function components:
 */
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles,withStyles } from '@material-ui/core/styles';
import PubNub from 'pubnub'
import { PubNubProvider, usePubNub } from 'pubnub-react'
import { useRouter } from 'next/router'
//import { subscribe } from 'on-screen-keyboard-detector';
import Hidden from '@material-ui/core/Hidden';
import axios from 'axios'
//import cookieCutter from 'cookie-cutter'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import SideDrawer from "./sideDrawer";
import { Home, KeyboardArrowUp } from "@material-ui/icons";
import { getCookies, removeCookies } from 'cookies-next';




const pubnub = new PubNub({
    publishKey: 'pub-c-5632f343-863a-4c69-9b95-cf32cbb628ed',
    subscribeKey: 'sub-c-112ce77a-d625-11ea-b0f5-2a188b98e439',
})

const defaults = {
    userId: `client4`,
    channels: ['coach4-client4'],
    channel: ['coach4-client4'],
    customerId: ``
}

const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
        flexGrow: 1,
      }
    },
    badgeColour: {
        backgroundColor: "#f3535b!important",
        color: "white"
    },
    small: {
        width: theme.spacing(4.2),
        height: theme.spacing(4.2),
    },
    sideDraw: {
        [theme.breakpoints.up('md')]: {
            flexGrow: 0,
            //backgroundColor: theme.palette.primary.main,
        },
        [theme.breakpoints.down('md')]: {
            flexGrow: 1,
            //backgroundColor: theme.palette.primary.main,
        },
    },
    hamburger: {
        margin: '0px 30px 0px 0px',
        flexGrow: 1,
    },
    logo: {
        flexGrow: 0,
        float: 'left',
        textAlign: 'left',
    },

    right: {
        flexGrow: 1,
        textAlign: 'right',
        float: 'right'
    },
    grow: {
        flexGrow: 1,
    }
}));

const StyledBadge = withStyles((theme) => ({
    badge: {
        //right: -3,
        //top: 13,
        backgroundColor: theme.palette.secondary.dark, //"#F55157!important",
        border: `2px solid ${theme.palette.background.paper}`,
        padding: '0 4px',
    },
}))(Badge);

const navLinks = [
    { title: `COACHES`, path: `/catalogsearch/result/?q=0&profile=6671&product_list_mode=list` },
    { title: `PROGRAMS`, path: `/catalogsearch/result/?q=0&profile=6672` },
    { title: `HOW IT WORKS`, path: `/how-it-works` },
    { title: `MY DETAILS`, path: `/customer/account/` },
  ];



const Header = () => {

    const router = useRouter();
    const pubnub = usePubNub()
    const [visibleChannels, setVisibleChannels] = useState(true);
    const [windowWidth, setWindowWidth] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);
    const [visible, setVisible] = useState(0);
    const [background, setBackground] = useState(0);
    const [didMount, setDidMount] = useState(false) // didMount = false goes first then, didMount = true;
    const messengeHomePath = window.location.href.indexOf('messages/client/none') >= 0; // The
    const [customer, setCustomer] = useState('')
    const [open, setOpen] = React.useState(false);
    let cookieImage = getCookies(null, 'coachImage');
    let selectedUserType;
    let selectedUserName;
    // Displayed in mobile header of user your are conversing with
    if (getCookies(null, 'selectedUserType') === 'coach') {
        selectedUserType = getCookies(null, 'coachImage');
        selectedUserName = getCookies(null, 'coachName');
    }
    else if ((getCookies(null, 'selectedUserType') === 'client')) {
        selectedUserType = getCookies(null, 'clientImage');
        selectedUserName = getCookies(null, 'clientName');
    }
    const [selectedUserTypeImage, setSelectedUserTypeImage] = useState(selectedUserType);
    const [selectedUserTypeName, setSelectedUserTypeName] = useState(selectedUserName);


    const anchorRef = React.useRef(null);
    const classes = useStyles();


    /* Menu functions */
    const handleToggle = () => {
        router.push(`/customer/account/`)
        // setOpen((prevOpen) => !prevOpen);
      };

      const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
          return;
        }
        setOpen(false);
      };

      function handleListKeyDown(event) {
        if (event.key === 'Tab') {
          event.preventDefault();
          setOpen(false);
        }
      }

      // return focus to the button when we transitioned from !open -> open
      const prevOpen = React.useRef(open);
      React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
          anchorRef.current.focus();
        }

        prevOpen.current = open;
      }, [open]);




    useEffect(() => {
        const fetchData = async () => {
            const respGlobal = await axios(
                `/customer/session/me`
            );
            const response = await axios(
                `/customer/session/me`
            );
            setCustomer(response.data.customer);
        };
        fetchData();
    }, [setCustomer])


    // Setting didMount to true upon mounting
    useEffect(() => setDidMount(true), [])


    // Get getUUIDMetadata
    useEffect ( () => {
        /*
        pubnub.objects.getUUIDMetadata(
            (status, response) => {
                console.log('getUUIDMetadata');
                console.log(repsonse);
            }
        );
        */
       pubnub.objects.getAllUUIDMetadata(
        {
            include: {
                customFields: true
            },
        },
        (status, response) => {
            //console.log('getUUIDMetadata');
            //console.log(response);
        }
       );
    }, [setCustomer, pubnub]);



    const deleteChannel = useCallback(
        async (event) => {
            let channelId = 'client' + customer.entity_id + '.' + 'coach' + router.query.id
            console.log(customer);
            console.log(router.query.id);
            pubnub.objects.removeChannelMetadata(
                {
                    channel: channelId
                },
                (status, response) => {
                    console.log('removeChannelMetadata');
                    console.log(channelId);
                    console.log(response);
                }
            );
        },
        [pubnub,customer],
      )



    return (
        <header className="App-header" id="HeaderContainer">
            <Toolbar
                disableGutters={true}
            >
                <div className="sideDraw">
                    <SideDrawer navLinks={navLinks} />
                </div>

                <div className={classes.logo}>
                    <img className="logoSvg" src="/header-logo.svg" onClick={() => router.push(`/`)} style={{ padding: '0px 0px 0px 22px' }} />
                </div>

                <div className={classes.right}>
                    <Hidden only={['xs', 'sm']}>
                        <Button className="d-sm-none" color="inherit" padding={50} onClick={() => router.push(`/wishlist`)} >Saved</Button>
                        <Button color="inherit" onClick={() => router.push(`/customer/account`)} style={{ padding: '0px' }}>My Details</Button>
                        <Button color="inherit"
                            onClick={(event) => {
                                event.preventDefault()
                                removeCookies(null, 'coachImage'); // cookies are deleted
                                removeCookies(null, 'coachName'); // cookies are deleted
                                removeCookies(null, 'clientImage'); // cookies are deleted
                                removeCookies(null, 'clientName'); // cookies are deleted
                                router.push(`/customer/account/logout`)
                            }}
                        >Logout</Button>
                    </Hidden>
                    <IconButton
                        aria-label="account of current user"
                        aria-controls="primary-search-account-menu"
                        aria-haspopup="true"
                        color="inherit"
                    >

                        <Badge
                            color="error"
                            classes={{badge: classes.badgeColour}}
                        >
                            <Avatar
                                src={`/media/customer/` + customer.my_customer_image}
                                className={classes.small}
                                style={{margin: '0px -2px 0px 9px'}}
                                onClick={handleToggle}
                                ref={anchorRef}
                                aria-controls={open ? 'menu-list-grow' : undefined}
                                aria-haspopup="true"
                                onClick={handleToggle}

                            >
                            </Avatar>
                        </Badge>
                        <Hidden only={['xs', 'sm']}>
                            <Button
                                style={{
                                    fontSize: '0.8125rem', // 13 px
                                    margin: '0em 0em 0em 0em',
                                    padding: '0px'
                                }}
                            >
                            {customer.firstname}
                            </Button>
                        </Hidden>


                        <Icon
                            classes={{root: classes.iconRoot}}
                            onClick={(e) => { router.push(`/checkout/cart`)  }}
                        >
                            <img className="cartIcon" src="/pub/media/minicart-svg.png"/>
                            <span className="miniCartCircle">

                            {
                                customer.items_count > 0 ?
                                    (
                                        <span className="miniCartNumber">
                                            {customer.items_count}
                                        </span>
                                        ) :
                                    (
                                        <div>&nbsp;</div>
                                    )
                            }
                            </span>
                        </Icon>



                        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                        {({ TransitionProps, placement }) => (
                            <Grow
                            {...TransitionProps}
                            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                            >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                    <MenuItem onClick={(e) => { handleClose; router.push(`/customer/account`)  }}>My Details</MenuItem>
                                    <MenuItem onClick={(e) => { handleClose; router.push(`/wishlist`)  }}>Saved</MenuItem>
                                    <MenuItem onClick={(e) => { handleClose; router.push(`/messages/client/none`)  }}>Messages</MenuItem>
                                    <MenuItem
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleClose;
                                            removeCookies(null, 'coachImage'); // cookies are deleted
                                            removeCookies(null, 'coachName'); // cookies are deleted
                                            removeCookies(null, 'clientImage'); // cookies are deleted
                                            removeCookies(null, 'clientName'); // cookies are deleted
                                            router.push(`/customer/account/logout`)
                                        }}
                                    >Logout</MenuItem>
                                </MenuList>
                                </ClickAwayListener>
                            </Paper>
                            </Grow>
                        )}
                        </Popper>
                    </IconButton>
                </div>
            </Toolbar>

            {router.asPath == '/messages/client/none' ?
                (
                    <div style={{ display: 'none'}}></div>
                )
                :
                (
                <Hidden only={['md', 'lg', 'xl']}>
                    <div style={{ width: '100%', borderTop: '1px solid #e0e0e0', paddingTop: '13px', paddingBottom: '13px' }}>
                        <Box
                            display="flex"
                            p={0}
                            m={0}
                            alignItems="center"
                        >
                            <Box p={0} flexGrow={1} style={{ textAlign: 'left' }}>
                                <Button color="inherit" padding={0} margin={0} onClick={() => router.push(`/messages/client/none`)}>&lt;  Messages</Button>
                            </Box>
                            <Box p={0} style={{ marginRight: '14px'}}>
                                <Avatar
                                    src={`/media/customer${selectedUserTypeImage}`}
                                    className={classes.small}
                                    style={{margin: '0px -2px 0px 9px'}}
                                    onClick={handleToggle}
                                    ref={anchorRef}
                                    aria-controls={open ? 'menu-list-grow' : undefined}
                                    aria-haspopup="true"
                                    onClick={handleToggle}
                                >
                                </Avatar>
                            </Box>
                            <Box p={0}>
                                {selectedUserTypeName}
                            </Box>
                            <Box p={0} flexGrow={1} style={{ textAlign: 'right', marginRight: '8px' }}>
                                <Button color="inherit" padding={0} margin={0}
                                onClick={(event) => {
                                    deleteChannel(event)
                                    //router.push(`/messages/client/none`)
                                  }}
                                >DELETE</Button>
                            </Box>
                        </Box>
                    </div>
                </Hidden>
                )
            }
        </header>
    )
}



export default function ScreenChannelList() {
    return (
        <PubNubProvider client={pubnub}>
            <Header />
        </PubNubProvider>
    )
  }
