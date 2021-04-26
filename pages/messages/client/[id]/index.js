//import React from 'react'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

const defaultTheme = createMuiTheme();
const theme = createMuiTheme({
  // Breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 479,
      md: 676,
      lg: 1220, //991,
      xl: 1700,
    },
  },
  // Custom fonts - calculated using Rem to pixel converton, 1 rem = 16px
  // https://offroadcode.com/rem-calculator/
  typography: {
    h1: {
      fontFamily: "Stratos-SemiBold",
    },
    h2: {
      fontFamily: "Stratos-Medium",
    },
    h3: {
      fontFamily: "Stratos-Medium",
    },
    h4: {
      fontFamily: "Stratos-Medium",
    },
    button: {
      fontFamily: "Stratos-Medium",
      fontSize: "0.8125rem",
      letterSpacing: "0.0em",
      margin: '0em 0em 0em 1.1em',
      fontWeight: '400',
    },
    body1: {
      fontFamily: "NeueHaasGroteskDisp Pro 55",
    },
  },

  palette: {
    type: 'light',
    primary: {
      main: '#00AAE1', // What is this, default ???
      dark: '#191919', // Main black in text
      contrastText: '#fff',
    },
    secondary: {
      main: '#64B42D', // What is this, default ???
      dark: '#F55157', // Main Peach in buttons
      contrastText: '#fff',
    },
    error: {
      main: '#BD0043',
      contrastText: '#fff',
    },
    divider: '#D7D6D5',
    background: {
      paper: '#fff',
      default: "#ffffff"
    }
  },

  overrides: {
    MuiToolbar: {

      regular: {
          height: '76px',
          letterPacing: '0px',
          margin: '0rem 0rem 0rem 0rem',
          padding: '0rem 0rem 0rem 0.0rem',

          [defaultTheme.breakpoints.up('sm')]: {
            paddingBottom: "0rem"

          },
          [defaultTheme.breakpoints.up('sm')]: {
            paddingBottom: "0rem"
          },
          [defaultTheme.breakpoints.up('xl')]: {
            paddingLeft: "0rem",
            paddingRight: "0rem"
          },
      }
    }
  },

  props: {
    // Name of the component ⚛️
    MuiButtonBase: {
      // The default props to change
      disableRipple: true, // No more ripple, on the whole application 💣!
    },
  }

});


const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  hideBody: {
      display: "none"
    }
}));


const Body = dynamic(() => import('../../../../components/chat/body'), { ssr: false, })
const ChannelList = dynamic(() => import('../../../../components/chat/channels'), { ssr: false })
const Header = dynamic(() => import('../../../../components/chat/header'), { ssr: false })

export default function Home() {
  /* Mobile Menu - Hide Body if on the URL messages/client/none */
  const router = useRouter()
  const [visible, setVisible] = useState(true);
  const [visibleBody, setVisibleBody] = useState(true);
  const [visibleChannels, setVisibleChannels] = useState(true);
  const [windowHeight, setWindowHeight] = useState(0);
  const [bodyHeight, setBodyHeight] = useState(0);
  const [didMount, setDidMount] = useState(false) // didMount = false goes first then, didMount = true;

  let style = { }


  /* Setting didMount to true upon mounting */
  useEffect(() => setDidMount(true), [])


  /* Actual window height
    - Calculate window height (Desktop)
    - Calculate window height (Mobile) with address bar, with keyboard, with address bar and keyboard
  */
  let resizeWindow = () => {
    // Calculate height of HeaderContainer (Top), MessageContainer (Body), SendContainer (Bottom)

    if (
      document.getElementById('HeaderContainer') === null && //document.getElementById('HeaderContainer').clientHeight &&
      document.getElementById('SideBar') === null && // document.getElementById('SideBar').clientHeight &&
      document.getElementById('MessageContainer') === null && //document.getElementById('MessageContainer').clientHeight &&
      document.getElementById('SendContainer') === null // && document.getElementById('SendContainer').clientHeight
  ) {

  }
  else {
      // Polling page until the Dom has loaded
      let messengeHomePath = window.location.href.indexOf('messages/client/none') >= 0;
      var interval = setInterval(function() {
          //alert(!router.route.includes("messages/client/none"));
          if (document.readyState === 'complete') {
            clearInterval(interval);
              if (!messengeHomePath) {

                  if (document.getElementById('HeaderContainer').clientHeight)
                    var headerContainer = document.getElementById('HeaderContainer').clientHeight;

                  if (document.getElementById('SideBar').clientHeight)
                    var sideBar = document.getElementById('SideBar').clientHeight;

                  if (document.getElementById('SendContainer').clientHeight)
                    var sendContainer = document.getElementById('SendContainer').clientHeight;

                  let chatWrapper = window.innerHeight - (headerContainer + sendContainer);
                  setBodyHeight(chatWrapper );   // height of body container
              }
              else {
                if (document.getElementById('HeaderContainer').clientHeight)
                  var headerContainer = document.getElementById('HeaderContainer').clientHeight;
                let chatWrapper = window.innerHeight - (headerContainer);
                setBodyHeight(chatWrapper );   // height of body container
              }
          }
      }, 100);
  }
    setWindowHeight(window.innerHeight);
  };


  // Set bodyContainer size, minus height of HeaderContainer (top) and Send Container (bottom)
  useEffect(() => {
    /* Mobile view: @TODO write detection script and unsbscribe directly after if not on mobile.*/
    if (didMount) {
        window.addEventListener("resize", resizeWindow);
        return () => window.removeEventListener("resize", resizeWindow);
    }
    else {
      resizeWindow()
    }
  }, [didMount, setDidMount]);


  useEffect(() => {

    const pathName = window.location.pathname;
      if (typeof window !== "undefined" && window.innerWidth < 676 && pathName.includes('messages/client/none') ) {
        setVisible(false);
      }

      if (typeof window !== "undefined" && window.innerWidth < 676 && pathName.includes('messages/client/none') ) {
        setVisibleBody(false);
      }

      if (typeof window !== "undefined" && window.innerWidth < 676 && !pathName.includes('messages/client/none') ) {
        setVisibleChannels(false);
      }


  }, [visible, setVisible, visibleBody, setVisibleBody, visibleChannels, setVisibleChannels ]);


  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title> </title>
        <link rel="icon" href="/favicon.ico" />
        <link href="/fonts/style.css" rel="stylesheet" />
        <meta name="viewport" content= "width=device-width, user-scalable=no" />
      </Head>
      <Container maxWidth="lg">
        <Header />
        <div className="chatWrapper" style={{ height: bodyHeight }}>
          <Grid container>
            <Grid item xs={12} md={3}>
              <div className="sideBar" id="SideBar">
                {visibleChannels ?
                    (
                      <ChannelList />
                    )
                    :
                    (
                      <p style={{ display: 'none' }}></p>
                    )
                  }
              </div>
            </Grid>
            <Grid className="contentBody" item xs={12} md={9}
              style={{ height: '100%'}}
            >
              <div
                className=""
                style={{ height: '100%'}}
              >
                {visible ?
                  (
                    <Body />
                  )
                  :
                  (
                    <p style={{ display: 'none' }}></p>
                  )
                }
              </div>
            </Grid>
          </Grid>
        </div>
        <style jsx>{``}</style>
        <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
      </Container>
    </MuiThemeProvider >
  )
}