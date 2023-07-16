

function addtocart(proId){
    $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        if(response.status){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
            $("#cart-count").html(count)

        }
    
      }
    })
  }  // this full code used to  add the items in cart(item name title image etc)
  //and also add ajax library link past to layout folder You can see 28 and 29 line links