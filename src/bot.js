import { replyMessage, replyButton ,sendMessage , sendPerMenu , getSousCategories,getFormatedCategorys ,DFS_searchCategorie , DBS_getProducts} from './facebook.js'
import config from './../config.js'
import { Client } from 'recastai'
var deepcopy = require("deepcopy");
const domaine = "http://51c356eb.ngrok.io/"
const client = new Client(config.recastToken, config.language)
var http = require("request-promise") ;
var urlHost =domaine+"/presta/prestaToJson.php";

var cat_org =[];
var options = {
    method: 'POST',
    uri: urlHost,
    headers: {
     'Content-Type': 'application/json; charset=utf-8'
     },
    body: {
        some: 'payload'
    },
    json: true // Automatically parses the JSON string in the response
};
http(options).then(confirmCallBack).catch(errorCallBack);

function errorCallBack(response){/*do something*/};
function confirmCallBack(response){
    cat_org =response;
};


function handlePostback(event){
    const senderID = event.sender.id
    if(typeof event.postback.payload != "undefined"){
      var payload = event.postback.payload;
      var type = payload.substring(0,6);
      var cat = deepcopy(cat_org);
      if (type == "ss_cat"){
          var id = payload.substring(7,8);
          var sous_categories = getFormatedCategorys(getSousCategories(cat,id));
          const messageData = prepareCatMessage(sous_categories,senderID);
          sendMessage(messageData);
       }
       if (type == "ss_pro"){
          var id = payload.substring(7,8);
          console.log(id);
          var category = DFS_searchCategorie(cat[0],id);
          console.log(category);
          var products = DBS_getProducts(category);
          console.log(products);
          const messageData = prepareProdMessage(products,senderID);
          sendMessage(messageData);
            
         }
       if (payload == "CATEGORIES")
       {
          var categories = getFormatedCategorys(cat) 
          const messageData = prepareCatMessage(categories,senderID);
          sendMessage(messageData);
       }  
        
    

    }
}

function prepareProdMessage(products,senderID){

  var elements = []
      products.forEach( (product) => {
          var element =  {
                   title: product.name ,
                   image_url:product.url_image,
                   subtitle:"reference :"+product.reference+"\nPrix : " + product.price.substring(0,4)+" DN",
                   default_action: {
                          type: "web_url",
                          url: domaine +"presta/index.php?id_product="+product.id+"&controller=product",
                          webview_height_ratio: "compact",
                                } ,
                     buttons:[
                        {
                          type:"web_url",
                          title : "Acheter",
                          url: domaine +"presta/index.php?id_product="+product.id+"&controller=product"
                        },
                        {
                          type : "postback",
                          title :"Produit similaires",
                          payload : "pr_sim_"+product.id
                        }]
                      }
           elements.push(element);             
        
      });

      var messageData = {
        recipient: {
          id: senderID,
        },
        message: {
          attachment: {
            type:"template",
            payload: 
            { template_type:"generic",
              elements: elements,
              image_aspect_ratio: "square"
            },
          },
        }

       }
      return messageData;
}
function prepareCatMessage(categories,senderID){
   var elements = []
      categories.forEach( (category) => {
          var element =  {
                   title: category.title ,
                   image_url:category.image_url,
                   subtitle: category.nb_produits + " produit",
                    default_action: {
                          type: "web_url",
                          url: domaine+"presta/index.php?id_category="+category.id+"&controller=category",
                          webview_height_ratio:"tall"
                                } ,
                     buttons:[
                        {
                          type : "postback",
                          title :"Les Sous-Catégories",
                          payload : "ss_cat_"+category.id
                        },{
                          type:"postback",
                          title : "Voir Les Produits ",
                          payload:"ss_pro_"+category.id
                        }]}
           if (typeof getSousCategories(cat_org,category.id) =="undefined") {
                  element.buttons[0].title = "Les Produits"
                  element.buttons[0].payload ="ss_pro_"+category.id
                  }             
           elements.push(element)             
      })

      var messageData = {
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
      return messageData;
}

function handleMessage(event) {
  const senderID = event.sender.id
  const messageText = event.message.text
  const messageAttachments = event.message.attachments
  if (messageText) {
    client.textConverse(messageText, { conversationToken: senderID }).then((res) => {
      const reply = res.reply()               /* To get the first reply of your bot. */
      const replies = res.replies             /* An array of all your replies */
      const action = res.action 
      var cat = deepcopy(cat_org);
      var categories = getFormatedCategorys(cat) 

      if (!reply) {
        var options = {}
        if(messageText == "webview"){
          const messageData = prepareCatMessage(categories,senderID);

       var persMenu = {
            get_started:{"payload":"GET_STARTED_PAYLOAD"},
            persistent_menu:[
            {
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
        ]
        }
       sendMessage(messageData)
       sendPerMenu(persMenu)
       console.log("message sent");  
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
      
    }
       else {
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
  handlePostback,
}
