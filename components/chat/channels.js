import React, { useCallback, useEffect, useState } from 'react'
/* Hooks React > 16.8: https://reactjs.org/docs/hooks-effect.html
 * - Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.
 * The Effect Hook lets you perform side effects in function components:
 */
import List from '@material-ui/core/List';

import PubNub from 'pubnub'
import { PubNubProvider, usePubNub } from 'pubnub-react'
import { useRouter } from 'next/router'
import axios from 'axios'
import ChannelItem from '../chat/channelItem.js';

const pubnub = new PubNub({
    publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY,
    subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY,
    //secretKey: process.env.NEXT_PUBLIC_PUBNUB_SECRET_KEY
})
const defaults = {
    userId: ``,
    channels: ``,
    channel: ``,
    customerId: ``,
    clientUUID: ``,
    coachUUID: ``
}


const Channel = () => {

    const router = useRouter()
    const { query } = router.query
    const [channels, setChannels] = useState([])
    const [customer, setCustomer] = useState('')

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

    useEffect(() => {
    }, [customer]);

    useEffect(() => {
        var filterExprStr = "uuid != '" + pubnub.getUUID() + "'";
        let UUID;

        if (customer.customer_status === 'client')
            UUID = `client${customer.entity_id}`
        else if (customer.customer_status === 'coach')
            UUID = `coach${customer.entity_id}`

        console.log('UUID: ' + UUID);


        const getMemberships = async () => {
            const response = await pubnub.objects.getMemberships(
                {
                    uuid: UUID,
                    include: {
                        customFields: true,
                        channelFields: true,
                        customChannelFields: true,
                        totalCount: true
                    }
                },
                (status, response) => {
                    //console.log('response.....');
                    //console.log(response);
                    if (typeof response !== 'undefined' && response.data.length > 0) {
                        let channelLength = response.data.length;
                        //console.log(response.data.length);
                        for (var i = 0; i < channelLength; i++) {
                            console.log('Channels (getMemberships)' + i)
                            console.log(response.data[i]);
                            setChannels(channels => channels.concat(response.data[i] ));
                        }
                    }
                }
            );
        };
        getMemberships();
    }, [customer, pubnub]);


    return (
        <div>
            {channels.map((channel, channelIndex) => {
                return (
                    <div>
                        <List
                            style={{
                                borderLeft: '1px solid #e0e0e0',
                                borderBottom: '1px solid #e0e0e0',
                                borderTop: '1px solid #e0e0e0',
                            }}
                            key={channelIndex}
                        >
                            <ChannelItem
                                channel={channel.channel}
                                custom={channel.custom}
                                channelIndex={channelIndex}
                                customer={customer}
                                name="asdfsf"
                                key={channelIndex}
                            />
                        </List>
                    </div>
                )
            })}
        </div>
    )
}
export default function clientChannelList() {
    return (
        <PubNubProvider client={pubnub}>
            <Channel />
        </PubNubProvider>
    )
}