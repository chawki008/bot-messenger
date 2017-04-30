import { replyMessage, replyButton ,sendMessage , sendPerMenu} from './facebook.js'
import config from './../config.js'
import { Client } from 'recastai'
var cat = require('./result.json') 
const client = new Client(config.recastToken, config.language)

function handleMessage(event) {
  const senderID = event.sender.id
  const messageText = event.message.text
  const messageAttachments = event.message.attachments
  if (messageText) {
    client.textConverse(messageText, { conversationToken: senderID }).then((res) => {
      console.log(cat)
      const reply = res.reply()               /* To get the first reply of your bot. */
      const replies = res.replies             /* An array of all your replies */
      const action = res.action 
                    /* Get the object action. You can use 'action.done' to trigger a specification action when it's at true. */
      var categories = []
      var category1 = {id : "1",
                    title:"Mode Homme",
                    image_url:"http://localhost/presta/img/c/3-category_default.jpg",
                    nb_produits:"1060" }
      var category2 = {id : "2",
                    title:"Mode Femme",
                    image_url:"http://localhost/presta/img/c/4-category_default.jpg",
                    nb_produits:"860" }
      categories.push(category1)
      categories.push(category2)
      var elements = []
      categories.forEach( (cat) => {
          var element =  {
                   title: cat.title ,
                   image_url:cat.image_url,
                   subtitle: cat.nb_produits + " produit",
                     buttons:[
                        {
                          type : "postback",
                          title :"les sous-catégories",
                          payload : "ss_cat_"+cat.id
                        },{
                          type:"postback",
                          title : "Produit populaires",
                          payload:"prods_"+cat.id
                        }]}
           elements.push(element)             
      })

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
            { template_type:"generic",
              elements: elements
            },
          },
        },

       }
       var persMenu = {
      get_started:{
      "payload":"GET_STARTED_PAYLOAD"
        },
        persistent_menu:[{
      "locale":"default",
      "composer_input_disabled":true,
      "call_to_actions":[
        {
          "title":"Nos categories",
          "type":"postback",
          "payload":"CATEGORIES"
          
        },
        {
          "type":"web_url",
          "title":"Contactez nous",
          "url":"http://petershats.parseapp.com/hat-news",
          "webview_height_ratio":"full"
        }
      ]
    },
    {
      "locale":"zh_CN",
      "composer_input_disabled":false
    }
  ]}
       sendMessage(messageData)
       sendPerMenu(persMenu)
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
