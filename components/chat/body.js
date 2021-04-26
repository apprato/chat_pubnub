import React, { useCallback, useEffect, useState, useRef } from 'react'
/* Hooks React > 16.8: https://reactjs.org/docs/hooks-effect.html
 * - Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.
 * The Effect Hook lets you perform side effects in function components:
 */
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { Autocomplete } from '@material-ui/lab';
import PubNub from 'pubnub'
//import { Elements } from '@stripe/react-stripe-js'
//import ElementsForm from '../../components/ElementsForm';
import Service from '../../components/chat/service';
import axios from "axios"
//import getStripe from '../../utils/get-stripejs'
import { PubNubProvider, usePubNub } from 'pubnub-react'
import { useRouter } from 'next/router'

import moment from 'moment';


// import './App.css'
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));
const pubnub = new PubNub({
  publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
})

var defaults = {
  userId: '',
  channels: [],
  channel: '',
  customerId: '',
  customerType: '',
  customerFirstName: '',
  customerLastName: '',
  customerImage: ''
}


const Chat = () => {
  const classes = useStyles()
  const el = useRef(null)
  const pubnub = usePubNub()
  const [messages, setMessages] = useState([])
  const [customer, setCustomer] = useState([])
  const [customerType, setCustomerType] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [services, setServices] = useState()
  const [input, setInput] = useState('')
  const [typingIndicator, setTypingIndicator] = useState('')
  const [pricingPackageSku, setPricingPackageSku] = useState('')
  const [pricingPackageTitle, setPricingPackageTitle] = useState('')
  const [pricingPackagePrice, setPricingPackagePrice] = useState('')
  const [productId, setProductId] = useState('')
  const [inputValue, setInputValue] = React.useState('');

  const router = useRouter()
  const { id } = router.query
  const { query } = router.query
  const [didMount, setDidMount] = useState(false) // didMount = false goes first then, didMount = true;
  const [loadMessages, setLoadMessages] = useState(false)

  // Only Mount once.
  useEffect(() => {
    const fetchData = async () => {
      const respGlobal = await axios(
        `/customer/session/me`
      );
      const response = await axios(
        `/customer/session/me`
      );

      // Redirect if not logged in
      if (!response.data.success) {
        router.push(`/customer/account/login/`);
      }

      // Populate Drop down array
      setServices(response.data.customer.services);
      setCustomer(response.data);
      setCustomerType(response.data.customer.customer_status);
      setCustomerId(response.data.customerId);
    };
    fetchData();
  }, [])

  // Setting didMount to true upon mounting
  useEffect(() => setDidMount(true), [])

  // Load initial messages and defaults & subscribe to channel.
  useEffect(() => {
    if (customer.customerId) {

      defaults.customerType = customer.customerType;
      customer.customer.customer_status === 'coach' ?
        defaults.channel = `client${router.query.id}.coach${customer.customerId}` : defaults.channel = `client${customer.customerId}.coach${router.query.id}`;
      customer.customer.customer_status === 'coach' ?
        defaults.userId = `coach${customer.customerId}` : defaults.userId = `client${customer.customerId}`;
      defaults.customerId = customer.customerId;

      defaults.customerFirstName = customer.customer.lastname;
      defaults.customerLastName = customer.customer.firstname;
      defaults.customerImage = `/media/customer${customer.customer.my_customer_image}`;

      pubnub.subscribe({
        channels: [defaults.channel],
      })

      if (didMount && !loadMessages) {
        // Load existing messages on channel.
        pubnub.fetchMessages(
          {
            channels: [defaults.channel],
            count: 1000000 // option
          },
          (status, response) => {
            let channel = defaults.channel;
            // Only add existing content if there is any
            if (typeof response !== 'undefined') {
              if (typeof response.channels[channel] !== 'undefined' ) {
                let channelLength = response.channels[channel].length;
                for (var i = 0; i < channelLength; i++) {
                  //console.log(response.channels[channel][i])
                  setMessages(messages => messages.concat(response.channels[channel][i]));
                }
              }
            }
          }
        );
        setLoadMessages(true);
      }
      else {
        //console.log('unMount');
      }
    }
  }, [customer, customerType, messages]);

  // Similar to componentDidMount and componentDidUpdate:
  // Think of useEffect Hook as componentDidMount, componentDidUpdate, and componentWillUnmount combined
  useEffect(() => {
    if (didMount) {
    }
    else {
      pubnub.addListener({
        message: (messageEvent) => {
          setMessages([...messages, messageEvent])
        },
        status: function (statusEvent) {
          if (statusEvent.category === "PNConnectedCategory") {
            console.log("Connected to PubNub!")
          }
          else {
            console.log('statusEvent (Error)')
            console.log(statusEvent);
          }
        },
        message: function (messageEvent) {
          setMessages(messages => messages.concat(messageEvent))
        }
      })
    }
  }, [messages])

  // Typing indicator
  useEffect(() => {
    if (didMount) {
    }
    else {
      pubnub.addListener({
        signal: function(s) {
          // handle signal
          var channelName = s.channel; // The channel
          var channelGroup = s.subscription; // The channel group
          var timetoken = s.timetoken; // Publish timetoken
          var message = s.message; // The Payload -
          var publisher = s.publisher; //The Publisher
          el.current.scrollIntoView({ block: 'end' })
          //  setTypingIndicator('Typing...');

          // @TODO - use the message payload above (message) to find the userId and then only display it for that user
          if (channelName == defaults.channel) {
            const timer = setTimeout(() => {
              setTypingIndicator('');
            }, 1000);
            return () => clearTimeout(timer);
          }
        }
      });
    }
  }, [typingIndicator, setTypingIndicator])

  // Move down after each message is added
  const scrollToBottom = () => {
    el.current.scrollIntoView({ block: 'end' })

    // Mark channel as read as the user has clicked on this and update timestamp for channel.


  }

  const roundToTwoDecimals = (number) => {
    return +(Math.round(number + "e+2")  + "e-2");
  }

  // Convert 17 digit PubNub UTC timeValue to 14 digit unix timestamp
  const formatPubNubTimeStamp = (timeValue) => {
    timeValue = (timeValue - (timeValue % 10000)) / 10000;
    let formatted = moment(timeValue).format('Do MMMM h:mm'); // "16007757138778941" 1600775713877
    return formatted;
  }

  const sendMessageOnEnter = useCallback(
    async (event,input) => {
      if (event.which === 13 || event.keyCode === 13 || event.key === "Enter") {
        await pubnub.publish({
          channel: defaults.channel,
          message: {
            content: event.target.value,
            from: defaults.userId,
            message: event.target.value,
            // Any other userful inormation, Magento customer id etc.
            meta: {
              from: {
                type: defaults.customerType,
                userId: defaults.userId,
                customerId: defaults.customerId,
                firstName : defaults.customerFirstName,
                lastName : defaults.customerLastName,
                image: defaults.customerImage
              }
            }
          }
        })
        // @TODO on monile when you press enter, the keyboard lingers.
        console.log(input);
        getApi(input)
        setInput('')
      }
      else {
        /*
        await pubnub.signal({
          message: 'typing_on',
          channel: defaults.channel
        }, (status, response) => {
        });
        */

      }
    }, [pubnub, setInput]
  )

  /*
   * Notify user/coaches when recieved message.
  */

function getApi(message){
      let body = JSON.stringify({
        channel: defaults.channel,
        message: {
          content: message,
          from: defaults.userId,
          message: message,
          // Any other userful inormation, Magento customer id etc.
          meta: {
            from: {
              type: defaults.customerType,
              userId: defaults.userId,
              customerId: defaults.customerId,
              firstName : defaults.customerFirstName,
              lastName : defaults.customerLastName,
              image: defaults.customerImage
            }
          }
        }
      });
      //console.log(body)
     axios.post(`/rest/V1/cs-customapi/getdata`,body, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(function(response) {
        return {status:200,data:response};
      }).catch(function(error) {
        return {status:401,data:error};
        console.log('Error on Authentication');
      });
}
  const sendMessage = useCallback(
    async (message) => {
      await pubnub.publish({
        channel: defaults.channel,
        message: {
          content: message,
          from: defaults.userId,
          message: message,
          // Any other userful inormation, Magento customer id etc.
          meta: {
            from: {
              type: defaults.customerType,
              userId: defaults.userId,
              customerId: defaults.customerId,
              firstName : defaults.customerFirstName,
              lastName : defaults.customerLastName,
              image: defaults.customerImage
            }
          }
        }
      })
      getApi(message)
      setInput('')
    },
    [pubnub, setInput],
  )

  const sendPricingPackage = useCallback(
    async (event) => {
      let messageContent = `${pricingPackageTitle} for $${pricingPackagePrice}.`;
      await pubnub.publish({
        channel: defaults.channel,
        message: {
          content: messageContent,
          from: defaults.userId,
          message: messageContent,
          // Any other userful inormation, Magento customer id etc.
          meta: {
            from: {
              type: defaults.customerType,
              userId: defaults.userId,
              customerId: defaults.customerId,
              firstName : defaults.customerFirstName,
              lastName : defaults.customerLastName,
              image: defaults.customerImage,
              // pricing package specific, differnt to sendMessage packet.
              pricingPackageTitle: pricingPackageTitle,
              pricingPackagePrice: pricingPackagePrice,
              pricingPackageSku: pricingPackageSku,
              productId: productId
            }
          }
        }
      })
    },
    [pubnub, setPricingPackageSku, setPricingPackageTitle, pricingPackagePrice],
  )


  const addServiceToCart = useCallback(
    async (event) => {
      // let messageContent = `Pricing package sent: ${pricingPackageTitle} for $${pricingPackagePrice}. Product reference code (SKU): ${pricingPackageSku}`;
      const response = await axios.post('/customer/session/cart', {
        productId: 347
      });

      const checkoutResponse = await axios(
        `checkout/cart`
      );
      //console.log(response);
    },
    [pubnub, setPricingPackageSku, setPricingPackageTitle, pricingPackagePrice],
  )

  const handleChange = (event, value) => {
    this.setState({
      value: event.target.value
    });
  }


  useEffect(scrollToBottom, [messages]);

  return (
    <div
      classNames="BodyContainer"
      style={{ height: '100%' }}
    >
      <div
        className='MessageContainer'
        id="MessageContainer"
      >


        <div
          className='MessageList'
        >
          {messages.map((message, messageIndex) => {
            let selectMessageViewed = false;

            return (

              (() => {
                if (router.query.id == 'view' && !selectMessageViewed && messageIndex == 0) {
                  return (
                    <Grid container spacing
                      style={{
                        marginLeft: '20px',
                      }}
                    >
                      <Grid item xs={12} lg={12}>
                        <Typography variant="h6">
                          Please select a channel to view your messages
                        </Typography>
                      </Grid>
                    </Grid>
                  )
                  selectMessageViewed = true;
                }

                if (router.query.id == 'view' && !selectMessageViewed && messageIndex > 0) {
                  return (
                    <div></div>
                  )
                }



                if (message.message.meta.from.userId == defaults.userId) { /* Current user logged in */
                  return (
                    <Grid container spacing={1}>
                      <Grid item xs={2} lg={1}>
                        <Avatar alt={defaults.firstName + ' ' + defaults.lastName} src={defaults.customerImage ? defaults.customerImage : '' } style={{ float: 'left', margin: '1rem 0rem 0rem 1rem' }} />
                      </Grid>
                      <Grid item xs={10} lg={11}>
                        <div
                          key={`message - ${messageIndex}`}
                          style={{
                            display: 'inline-block',
                            backgroundColor:
                              message.message.meta.from.userId === defaults.userId
                                ? '#f0f0f0'
                                : `#f3f0fd`,
                            color: 'black',
                            borderRadius: '9px',
                            margin: '5px',
                            padding: '8px 15px',
                            clear: 'both',
                            margin:
                              message.message.meta.from.userId === defaults.userId
                                ? '5px 50px 10px 0px'
                                : `5px 0px 10px 50px`,
                            float: 'left'
                          }}
                        >
                          <Typography variant="body1">
                            {message.message.content}
                          </Typography>
                        </div>
                        <div
                          key={`message-${messageIndex}`}
                          style={{
                            display: 'inline-block',
                            color: 'black',
                            borderRadius: '9px',
                            margin: '5px',
                            padding: '0px 15px',
                            clear: 'both',
                            margin:
                              message.message.meta.from.userId === defaults.userId
                                ? '0px 10px 40px 0px'
                                : `0px 0px 40px 50px`,
                            float: 'left'
                          }}
                        >
                          <Typography variant="p"
                            style={{
                              color: '#C0C0C0',
                            }}
                          >
                            {formatPubNubTimeStamp(message.timetoken)}
                          </Typography>
                        </div>
                      </Grid>
                    </Grid>
                  )
                } else { /* Other user talking to in the chat */
                  return (
                    <Grid container spacing={1}>
                      <Grid item xs={10} lg={11}>
                        <div
                          key={`message_${messageIndex}`}
                          style={{
                            display: 'inline-block',
                            backgroundColor:
                              message.message.meta.from.userId === defaults.userId
                                ? '#f0f0f0'
                                : `#f3f0fd`,
                            color: 'black',
                            borderRadius: '9px',
                            margin: '5px',
                            padding: '8px 15px',
                            clear: 'both',
                            margin:
                              message.message.meta.from.userId === defaults.userId
                                ? '5px 50px 10px 0px'
                                : `5px 0px 10px 50px`,
                            float: 'right'
                          }}
                        >

                          {message.message.meta.from.pricingPackagePrice ?
                            (
                              <div>
                                <Typography variant="body1">
                                  {message.message.meta.from.pricingPackageTitle} - { message.message.meta.from.firstName + ' ' + message.message.meta.from.lastName} - ${roundToTwoDecimals(message.message.meta.from.pricingPackagePrice)}
                                </Typography>
                                <br />
                                <h4>Pricing Package</h4>
                                <br />
                                <Service messageService={message} pricingPackagePrice={message.message.meta.from.pricingPackagePrice} price={message, message.message.meta.from.pricingPackagePrice} />
                              </div>
                            )
                            :
                            (
                              /* Standard Message sent */
                              <Typography variant="body1">
                              {message.message.content}
                              </Typography>

                            )
                          }
                        </div>
                        <div
                          key={`message - ${messageIndex}`}
                          style={{
                            display: 'inline-block',
                            color: 'black',
                            borderRadius: '9px',
                            margin: '5px',
                            padding: '0px 15px',
                            clear: 'both',
                            margin:
                              message.message.meta.from.userId === defaults.userId
                                ? '0px 10px 40px 0px'
                                : `0px 0px 40px 50px`,
                            float: 'right'
                          }}
                        >
                          <Typography variant="p"
                            style={{
                              color: '#C0C0C0',
                            }}
                          >
                            {formatPubNubTimeStamp(message.timetoken)}
                          </Typography>
                        </div>
                      </Grid>
                      <Grid item xs={2} lg={1}>
                        <Avatar alt={ message.message.meta.from.firstName + ' ' + message.message.meta.from.lastName } src={message.message.meta.from.image ? message.message.meta.from.image : '/static/images/avatar/1.jpg' } style={{ float: 'right', margin: '1rem 1rem 0rem 0rem' }} />
                      </Grid>
                    </Grid>

                  )
                }

              })()

            )
          })}

        <Grid item xs={7} md={6} lg={4}>
          <div style = {{ display: 'none' }}>
            {
              customerType === 'client' ?
                (
                  <Button
                    onClick={(event) => {
                      addServiceToCart(event)
                    }}
                  >Add Service to Cart</Button>
                ) :
                (
                  <div>&nbsp;</div>
                )
            }
          </div>
        </Grid>



          <div>{typingIndicator}</div>
          <div ref={el} style={{ clear: 'both' }}></div>
        </div>
      </div>

      <Grid
        id="SendContainer"
        container
        style={{
          border: '1px solid #e0e0e0'        }}
      >
        <Grid item xs={5} md={6} lg={8}>
          <div>
            {
              customerType === 'coach' ?
                (
                  <Autocomplete
                    onChange={(event, value) => {
                      setPricingPackageSku(value.sku);
                      setPricingPackageTitle(value.title);
                      setPricingPackagePrice(value.price);
                      setProductId(value.entity_id);
                    }}
                    onInputChange={(event, newInputValue) => {
                      setInputValue(newInputValue);
                    }}
                    id="comboBox"
                    options={services}
                    getOptionLabel={(option) => option.title}
                    style={{ float: '100%', margin: '0px 20px 20px 0px' }}
                    renderInput={(params) => <TextField {...params} label="Select Service" variant="outlined" />}
                  />
                ) :
                (
                  <div></div>
                )
            }
          </div>
        </Grid>
        <Grid item xs={7} md={6} lg={4}>
          <div>
            {
              customerType === 'coach' ?
                (
                  <Button
                    style={{
                      backgroundColor: '#f3535b',
                      color: '#FFFFFF',
                      height: '40px',
                      borderRadius: '3px',
                      fontSize: '16px',
                      border: '1px solid #f3535b',
                      padding: '10px 30px 10px 30px',
                      float: 'right'
                    }}
                    onChange={(event, newValue) => {
                      setValue(newValue);
                    }}
                    inputValue={inputValue}
                    onInputChange={(event, newInputValue) => {
                      setInputValue(newInputValue);
                    }}
                    onClick={(event) => {
                      sendPricingPackage(event)
                    }}
                  >
                    SEND PRICING PACKAGE
                  </Button>
                ) :
                (
                  <div></div>
                )
            }
          </div>
        </Grid>


        <Grid container
          style={{
            padding: '20px'
          }}
        >
          <Grid item xs={7} sm={8} lg={9} md={8}>
            <TextareaAutosize
              aria-label="minimum height"
              rowsMin={3}
              rowsMax={5}
              style={{
                fontFamily: "NeueHaasGroteskDisp Pro 55",
                borderRadius: '0px',
                flexGrow: 1,
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                width: '100%'
              }}
              placeholder="  Type a message"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
              }}
              onKeyDown={(e) => {
                sendMessageOnEnter(e,input)
              }}
            />
          </Grid>
          <Grid item xs={5} sm={4} lg={3} md={4}>
            <Button
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
              onClick={(e) => {
                e.preventDefault()

                sendMessage(input)
              }}
            >
              SEND
              </Button>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default function ScreenClient1Coach() {
  return (
    <PubNubProvider client={pubnub}>
      <Chat />
    </PubNubProvider>
  )
}
