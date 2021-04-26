import React, { useCallback, useEffect, useState } from 'react'
/* Hooks React > 16.8: https://reactjs.org/docs/hooks-effect.html
 * - Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.
 * The Effect Hook lets you perform side effects in function components:
 */
import Avatar from '@material-ui/core/Avatar';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router'
import axios from 'axios'
import Button from "@material-ui/core/Button";
import Alert from '@material-ui/lab/Alert';


const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      }
    },
    badgeColour: {
        backgroundColor: "#f3535b!important",
        color: "white"
      }
  }));

const Service = ({messageService, pricingPackagePrice}) => {
    const router = useRouter()
    const [msg, setMsg] = useState('')
    const classes = useStyles();

    const addServiceToCart = useCallback(
      async (event) => {
        const response = await axios.post('/customer/session/cart', {
          productId: messageService.message.meta.from.productId
        });
        console.log(response);
        console.log(response.data);
        setMsg(response.data.message);
        router.push(`/checkout/cart`, undefined, { shallow: true });
        /*
        const checkoutResponse = await axios(
          `https://staging.onekeelo.com/checkout/cart`
        );
        },
      [msg, setMsg],
        */
      //);
      }, [msg, setMsg]
    )

    useEffect(() => {

    }, [])


    return (
        <div>
            <Button
              onClick={(event) => {
                  addServiceToCart(event)
              }}
              style={{
                backgroundColor: '#f3535b',
                color: '#FFFFFF',
                height: '40px',
                borderRadius: '3px',
                fontSize: '16px',
                border: '1px solid #f3535b',
                padding: '10px 30px 10px 30px',
                float: 'left',
                marginRight: '20px'
              }}
            >Add to Cart</Button>
            <Button
              onClick={() => router.push(`/checkout/cart`, undefined, { shallow: true })}
              style={{
                backgroundColor: '#f3535b',
                color: '#FFFFFF',
                height: '40px',
                borderRadius: '3px',
                fontSize: '16px',
                border: '1px solid #f3535b',
                padding: '10px 30px 10px 30px',
                float: 'right',
                marginRight: '20px'
              }}
            >Checkout</Button>
            <br />
            <br />
            <br />
            {msg ?
                            (
                              <Alert severity="success">{msg}</Alert>
                            )
                            :
                            (
                              <p style={{ display: 'none' }}></p>
                            )
                          }
        </div>
    )
}


export default Service
