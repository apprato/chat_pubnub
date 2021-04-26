import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText
  } from "@material-ui/core";
  import { makeStyles } from "@material-ui/core/styles";
  import { Menu } from "@material-ui/icons";
  import MenuIcon from '@material-ui/icons/Menu';
  import Hidden from '@material-ui/core/Hidden';
  import { useState } from "react";

  const useStyles = makeStyles({
    list: {
      width: 250
    },
    linkText: {
      textDecoration: `none`,
      textTransform: `uppercase`,
      color: `black`
    }

  });

  const SideDrawer = ({ navLinks }) => {
    const classes = useStyles();
    const [state, setState] = useState({ left: false });

    const toggleDrawer = (anchor, open) => event => {
      if (
        event.type === "keydown" &&
        (event.key === "Tab" || event.key === "Shift")
      ) {
        return;
      }

      setState({ [anchor]: open });
    };

    const sideDrawerList = anchor => (
      <div
        className={classes.list}
        role="presentation"
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
      >



        <div className="header-mobile-responsive">


          <div className="mob-search-field">
            <div className="mob-header-nav">
                <ul>
                  <li><a href="/catalogsearch/result/?q=0&amp;profile=6671&amp;product_list_mode=list">COACHES</a></li>
                  <li><a href="/catalogsearch/result/?q=0&amp;profile=6672">PROGRAMS</a></li>
                  <li><a href="/how-it-works">HOW IT WORKS</a></li>
                  <li>
                      <span className="header_account_link_list login">
                        <a className= "header_account_link" href="/customer/account/login"></a>
                      </span>
                  </li>
                  <li>
                      <a href="/customer/account/">My Details</a>
                  </li>
                  <li>
                      <button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                      <img src="/pub/media/images/australia.svg" />/AUD</button>
                  </li>
                </ul>
            </div>
          </div>


        </div>


      </div>
    );

    return (
      <div className="">
        <Hidden only={['md', 'lg', 'xl']}>
          <div className="toggleButton" onClick={toggleDrawer("left", true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <Drawer
            anchor="left"
            open={state.left}
            onOpen={toggleDrawer("left", true)}
            onClose={toggleDrawer("left", false)}
          >
            {sideDrawerList("left")}
          </Drawer>
        </Hidden>
      </div>
    );
  };

  export default SideDrawer;
