import config from './../config.js'
import request from 'request'

var domaine = "http://51d123df.ngrok.io/"
/*
* call to facebbok to send the message
*/


var search_product = function search_product(product_name,root){
  var products = DBS_getProducts( root[0] );
  var product_s = []
  products.forEach((product) => {
                
            if (product.name.toUpperCase().indexOf(product_name.toUpperCase()) !== -1){
                product_s.push(product);  
                  }
              })
  return product_s;
}

function sendMessage(messageData) {
  return new Promise((resolve, reject) => {
    request({
          uri: 'https://graph.facebook.com/v2.6/me/messages',
          qs: { access_token: config.pageAccessToken },
          method: 'POST',
          json: messageData,
          }, 
          (error, response , body) => {
            if (!error && response.statusCode === 200) {
              console.log('All good job is done')
              resolve()
            } else {
              console.log(body)
              reject(error)
            }
            })
  })
}
function sendPerMenu(messageData) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
      qs: { access_token: config.pageAccessToken },
      method: 'POST',
      json: messageData,
    }, (error, response , body) => {
      if (!error && response.statusCode === 200) {
        console.log('Persistent menu is set')
        resolve()
      } else {
        console.log(body)
        reject(error)
      }
    })
  })
}

/*``
* type of message to send back
*/

function replyMessage(recipientId, messageText) {
  return new Promise((resolve, reject) => {

    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: messageText,
      },
    }
    sendMessage(messageData).then(() => {
      resolve()
    }).catch( err => {
      reject(err)
    })
  })
}

function replyButton(recipientId, option) {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: option.elementsTitle,
            buttons: [{
              type: option.buttonType,
              url: option.buttonUrl,
              title: option.buttonTitle,
            }],
          }],
        },
      },
    },
  }
  sendMessage(messageData)
}
// get nb products under root node
var DBS_nbProduct = function(root){
    var node = root ;
    var stack = [] ;
    node.discovred = false ;
    stack.push(node) ;
    var nbProduct = 0 ;
    while(  stack.length != 0){
      node =   stack.pop(0) ;
      nbProduct += node.products.length
      if(!node.discovred){
        node.discovred = true ;
        if(typeof node.sous_categorie != "undefined" ){
          node.sous_categorie.forEach(function(element) {
              element.discovred = false ;
              stack.push(element) ;
          });
        }
      }
    }
    return nbProduct;
}
// get formated categories
var getFormatedCategorys = function(categoryJson){
var categorys = []
  categoryJson.forEach(function(element) {
      var category = {id : element.id,
                     title:element.name ,
                     image_url:domaine+"presta/img/c/"+ element.id+"c.jpg",
                     nb_produits:DBS_nbProduct(element) }
     categorys.push(category);
  });
  return categorys;
}
// get category node by id
var DFS_searchCategorie = function(root,id){
  var node = root ;
  var stack = [] ;
  node.discovred = false ;
  stack.push(node) ;
  while(  stack.length != 0){
    node =   stack.pop(0) ;
    if (node.id == id){
      return node ;
    }
    if(!node.discovred){
      node.discovred = true ;
      if(typeof node.sous_categorie != "undefined" ){
        node.sous_categorie.forEach(function(element) {
            element.discovred = false ;
            stack.push(element) ;
        });
      }
    }
  }
}
// get sous categories of a given categoru id
var getSousCategories = function(categories,id){
  var root = {"id" : 0 , "sous_categorie" : categories} ;
  var categorie  = DFS_searchCategorie(root , id);
  if (typeof categorie != "undefined"){
    return categorie.sous_categorie ;
  }
}
// @params give it root node categorie
var DBS_getProducts = function(root){
    var node = root ;
    var stack = [] ;
    node.discovred = false ;
    stack.push(node) ;
    var products = [] ;
    while(  stack.length != 0){
      node =   stack.pop(0) ;
      products = products.concat(node.products);
      if(!node.discovred){
        node.discovred = true ;
        if(typeof node.sous_categorie != "undefined" ){
          node.sous_categorie.forEach(function(element) {
              element.discovred = false ;
              stack.push(element) ;
          });
        }
      }
    }
    return products;
}


module.exports = {
  replyMessage,
  replyButton,
  sendMessage,
  sendPerMenu,
  getSousCategories,
  getFormatedCategorys,
  DFS_searchCategorie,
  DBS_getProducts,
  search_product,
}
