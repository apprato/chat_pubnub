import React, { useCallback, useEffect, useState, useRef } from 'react'
/* Hooks React > 16.8: https://reactjs.org/docs/hooks-effect.html
 * - Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.
 * The Effect Hook lets you perform side effects in function components:
 */
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import PubNub from 'pubnub'
import { PubNubProvider, usePubNub } from 'pubnub-react'
import { useRouter } from 'next/router'
import axios from 'axios'
import moment from 'moment';
import { getCookies, setCookies, removeCookies } from 'cookies-next';

const pubnub = new PubNub({
    publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
    subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
    secretKey: process.env.NEXT_PUBLIC_PUBNUB_SECRET_KEY
})
const defaults = {
    userId: ``,
    channels: ``,
    channel: ``,
    customerId: ``
}

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


const ChannelItem = ({channel, custom, channelIndex, customer, name}) => {
    const router = useRouter()
    const [channelCount, setChannelCount] = useState('')
    const [messageDate, setMessageDate] = useState('')
    const [lastMessage, setLastMessage] = useState('')
    const [activeId,setActiveId]=useState("")
    const classes = useStyles();
    console.log('channel.custom.lastReadTimetoken: ');
    console.log(custom);

    useEffect(() => {
        const fetchData = async () => {
            const response = pubnub.messageCounts({
                channels: [channel.name],
                channelTimetokens: ['16107221688000000' ],
                channelTimetokens: [`${custom.lastReadTimetoken}` ],
              }, (status, results) => {
                //if (typeof results.channels[channel] !== 'undefined' && results.channels[channel].length > 0) {
                if (typeof results !== 'undefined') {   //&& results.channels[channel.name]> 0) {
                    setChannelCount(results.channels[channel.name]);
                }
                else {
                    setChannelCount(0);
                }
            });
        };
        fetchData();

    }, [channelCount, setChannelCount])

    useEffect(()=>{
    let chId=channel.id;
    let data=  chId.split(".");
    let clientId = window.location.pathname.split("/")
       if(customer.customer_status === 'coach'){
           var cls = String("client"+clientId[3]+".coach"+customer.entity_id);
           setActiveId(cls)
       }else{
        var cls = String("client"+customer.entity_id+".coach"+clientId[3]);
        setActiveId(cls)
       }
    },[])

    useEffect(() => {
        const fetchMessageDateData = async () => {
            const response = pubnub.fetchMessages({
                channels: [channel.name],
                end: '15518041524300251',
                count: 1
            },
                (status, results) => {
                    //console.log(results);
                    if (typeof results.channels[channel.name] !== 'undefined') { // Is there a message to then get the last message saved in the channel list.
                        setMessageDate(results.channels[channel.name][0].timetoken);
                        //console.log('last message');
                        //console.log(results.channels[channel.name][0].message.content);
                        var string = results.channels[channel.name][0].message.content;
                        var length = 30;
                        var trimmedString = string.substring(0, length);
                        setLastMessage(trimmedString);
                    }
                }
            );
        };
        fetchMessageDateData();

    }, [messageDate, setMessageDate, setLastMessage])


    // Convert 17 digit PubNub UTC timeValue to 14 digit unix timestamp
    const formatPubNubTimeStamp = (timeValue) => {
        timeValue = (timeValue - (timeValue % 10000)) / 10000;
        let formatted = moment(timeValue).format('Do MMMM h:mm'); // "16007757138778941" 1600775713877
        return formatted;
    }


    return (
        <div class={activeId === channel.id ? "active_avatar" :""} >

            <ListItem key={`channel - ${channelIndex}`}  id={channelIndex}>
                <ListItemAvatar >
                {
                    customer.customer_status === 'coach' ?
                        (  /* Coaches  - https://staging.onekeelo.com/media/customer/5f3e560dd5e54.jpeg */
                            <Badge
                                color="error"
                                classes={{badge: classes.badgeColour}}
                                badgeContent={channelCount}
                            >
                                <Avatar
                                    src={`/media/customer${channel.custom.clientImage}`}
                                    onClick={
                                        () => {
                                            // Create timestamp to initially set for the messageCount to read
                                            let timestamp   = +new Date;
                                            let time = timestamp * 10000;
                                            let UUID = `coach${customer.entity_id}`;

                                            const setChannelCursorClient = async () => {
                                                const response = await pubnub.objects.setMemberships({
                                                    uuid: UUID,
                                                    channels: [
                                                        {
                                                            id: channel.id,
                                                            custom: {
                                                                lastReadTimetoken: 'asdfas'
                                                            }
                                                        }
                                                    ],
                                                    include: {
                                                        // To include channel fields in response
                                                        customFields: true,
                                                        channelFields: true,
                                                        customChannelFields: true,
                                                        totalCount: true
                                                   }
                                                }, (status, response) => {
                                                    console.log('setChannelCursorClient');
                                                    console.log(response.data);

                                                    setCookies(null, 'clientName', channel.custom.clientName);
                                                    setCookies(null, 'clientImage', channel.custom.clientImage);
                                                    setCookies(null, 'selectedUserType', 'client');
                                                    router.push(`/messages/coach/${channel.custom.clientCustomerId}`, undefined, { shallow: true })
                                                });
                                            };
                                            setChannelCursorClient()
                                        }
                                    }
                                    >
                                </Avatar>
                            </Badge>
                        ) :
                        (  /* Clients */
                            <Badge
                                color="error"
                                classes={{badge: classes.badgeColour}}
                                badgeContent={channelCount}
                            >
                                <Avatar
                                    src={`/media/customer${channel.custom.coachImage}`}
                                    onClick={
                                        () => {

                                            // Create timestamp to initially set for the messageCount to read
                                            let timestamp   = +new Date;
                                            let time = timestamp * 10000;
                                            let UUID = `client${customer.entity_id}`;

                                            const setChannelCursorCoach = async () => {
                                                const response = await pubnub.objects.setMemberships({
                                                    uuid: UUID,
                                                    channels: [
                                                        {
                                                            id: channel.id,
                                                            custom: {
                                                                lastReadTimetoken: time
                                                            }
                                                        }
                                                    ],
                                                    include: {
                                                        // To include channel fields in response
                                                        customFields: true,
                                                        channelFields: true,
                                                        customChannelFields: true,
                                                        totalCount: true
                                                   }
                                                }, (status, response) => {
                                                    console.log('setChannelCursorCoach');
                                                    console.log(response.data);

                                                    setCookies(null, 'coachName', channel.custom.coachName);
                                                    setCookies(null, 'coachImage', channel.custom.coachImage);
                                                    setCookies(null, 'selectedUserType', 'coach');
                                                    router.push(`/messages/client/${channel.custom.coachCustomerId}`, undefined, { shallow: true })
                                                });
                                            };
                                            setChannelCursorCoach();
                                        }
                                    }
                                    >
                                </Avatar>
                            </Badge>
                        )
                }
                </ListItemAvatar>
                {
                    customer.customer_status === 'coach' ?
                        (   /* Coaches */
                            <ListItemText
                                primary={`${channel.custom.clientName}`}
                                secondary={formatPubNubTimeStamp(messageDate)}
                                onClick={
                                    () => {
                                            // Create timestamp to initially set for the messageCount to read
                                            let timestamp   = +new Date;
                                            let time = timestamp * 10000;
                                            let UUID = `coach${customer.entity_id}`;

                                            const setChannelCursorClient = async () => {
                                                const response = await pubnub.objects.setMemberships({
                                                    uuid: UUID,
                                                    channels: [
                                                        {
                                                            id: channel.id,
                                                            custom: {
                                                                lastReadTimetoken: time
                                                            }
                                                        }
                                                    ],
                                                    include: {
                                                        // To include channel fields in response
                                                        customFields: true,
                                                        channelFields: true,
                                                        customChannelFields: true,
                                                        totalCount: true
                                                   }
                                                }, (status, response) => {
                                                    setCookies(null, 'clientName', channel.custom.clientName);
                                                    setCookies(null, 'clientImage', channel.custom.clientImage);
                                                    setCookies(null, 'selectedUserType', 'client');
                                                    router.push(`/messages/coach/${channel.custom.clientCustomerId}`, undefined, { shallow: true })
                                                });
                                            };
                                            setChannelCursorClient()
                                    }
                                }
                            />
                        ) :
                        (   /* Clients */
                            <ListItemText
                                primary={`${channel.custom.coachName}`}
                                secondary={lastMessage  &&  messageDate ? lastMessage + '...  ' + formatPubNubTimeStamp(messageDate): formatPubNubTimeStamp(messageDate)}
                                onClick={
                                    () => {
                                            // Create timestamp to initially set for the messageCount to read
                                            let timestamp   = +new Date;
                                            let time = timestamp * 10000;
                                            let UUID = `client${customer.entity_id}`;

                                            const setChannelCursorCoach = async () => {
                                                const response = await pubnub.objects.setMemberships({
                                                    uuid: UUID,
                                                    channels: [
                                                        {
                                                            id: channel.id,
                                                            custom: {
                                                                lastReadTimetoken: time
                                                            }
                                                        }
                                                    ],
                                                    include: {
                                                        // To include channel fields in response
                                                        customFields: true,
                                                        channelFields: true,
                                                        customChannelFields: true,
                                                        totalCount: true
                                                   }
                                                }, (status, response) => {
                                                    setCookies(null, 'coachName', channel.custom.coachName);
                                                    setCookies(null, 'coachImage', channel.custom.coachImage);
                                                    setCookies(null, 'selectedUserType', 'coach');
                                                    router.push(`/messages/client/${channel.custom.coachCustomerId}`, undefined, { shallow: true })
                                                });
                                            };
                                            setChannelCursorCoach();
                                    }
                                }
                            />
                        )
                }
            </ListItem>
        </div>
    )
}


export default ChannelItem
