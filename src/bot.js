import { replyMessage, replyButton ,sendMessage} from './facebook.js'
import config from './../config.js'
import { Client } from 'recastai'

const client = new Client(config.recastToken, config.language)

function handleMessage(event) {
  const senderID = event.sender.id
  const messageText = event.message.text
  const messageAttachments = event.message.attachments
  if (messageText) {
    client.textConverse(messageText, { conversationToken: senderID }).then((res) => {
      const reply = res.reply()               /* To get the first reply of your bot. */
      const replies = res.replies             /* An array of all your replies */
      const action = res.action               /* Get the object action. You can use 'action.done' to trigger a specification action when it's at true. */

      if (!reply) {
        
        var options = {}
        if(messageText == "webview"){
          const messageData = {
        recipient: {
          id: senderID,
        },
        message: {
          attachment: {
            type:"template",
            payload: 
{              template_type:"generic",
              elements:[
                {
                   title: "Hello" ,
                   image_url:"http://fo.demo.prestashop.com/10-large_default/printed-dress.jpg",
                   subtitle:"subtitle",
                   default_action:{
                      type:"web_url",
                      url:"https://www.vongo.tn",
                      webview_height_ratio:"tall",
                     },
                    buttons:[
                        {
                          type : "web_url",
                          url : "https://fr.slideshare.net/mathieu_lacage/ns3-tutorial",
                          title :"ns3-tutorial"
                        },{
                          type:"postback",
                          title : "start chatting",
                          payload:"COOL"

                        }


                      ] 
 
                  },
                 {
                   title: "Hello" ,
                    image_url:"http://fo.demo.prestashop.com/10-large_default/printed-dress.jpg",
                  
                 },
                 {
                   title: "How low " ,
                    image_url:"http://fo.demo.prestashop.com/10-large_default/printed-dress.jpg",
                  
                 }
                   
                    //} 
                   ]
            },
          },
        },
       }
       
       sendMessage(messageData)
       console.log("message sent")  
      }
        else{
        options = {
          messageText: null,
          buttonTitle: 'My first button',    /* Option of your button. */
          buttonUrl: 'https://recast.ai/',   /* If you like more option check out ./facebook.js the function replyButton, and look up */
          buttonType: 'web_url',             /* the facebook doc for button https://developers.facebook.com/docs/messenger-platform/send-api-reference#message */
          elementsTitle: 'Hey dick head ! ',
        }
        replyButton(senderID, options)        /* to reply a button */
        }
      } else {
        if (action && action.done === true) {
          console.log('action is done')
          // Use external services: use res.memory('notion') if you got a notion from this action
        }
        let promise = Promise.resolve()
        replies.forEach(rep => {
          promise = promise.then(() => replyMessage(senderID,rep))
        })
        promise.then(() => {
          console.log('ok')
        }).catch(err => {
          console.log(err)
        })
      }
    }).catch(err => {
      console.log(err)
    })
  } else if (messageAttachments) {
    replyMessage(senderID, 'Message with attachment received')
  }
}
module.exports = {
  handleMessage,
}
