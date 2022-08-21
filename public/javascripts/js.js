
function addToCart(proid, userId) {
  const cartCount = document.getElementById("cartCount");
  if (userId) {
    axios.post("/addToCart/" + proid, { user: userId }).then((res) => {
      if (res.status == 200) {
        console.log(res);
        cartCount.innerHTML = res.data.cartCount[0].count;
      }
    });
  } else {
    swal("Please Sign In", "", "error");
  }
}

function deleteCartItem(proId) {
  console.log(proId);
  axios.get(`/deleteCartItem/${proId}`).then(async (res) => {
    await console.log(res);
    window.location.reload();
  });
}

function coupon() {
  const code = document.getElementById("code").value;
  if(code){
    axios.get(`/couponCheck/${code}`).then((res) => {
    console.log(res);
    if (res.data.response) {
      const percentage = parseInt(res.data.response.Percentage);
      const subTotal = document.getElementById("subTotal");
      const coupon = document.getElementById("couponPrice");
      coupon.innerHTML = (parseInt(subTotal.innerHTML) / 100) * percentage;
      document.getElementById("grandTotal").innerHTML =
        parseInt(subTotal.innerHTML) - parseInt(coupon.innerHTML);
    } else if (res.data.used) {
      swal("Sorry! This Coupon is Used!",'','info');
    } else {
      swal("Invalid Coupon Code!", ' ', 'info');
    }
  });
  }else{
    swal('Please Enter the Code!','','info')
  }
  
}

function addToWishList(proId) {
  const wishCount = document.getElementById('wishCount')
  axios.get("/addToWishList/" + proId).then((e) => {
    if(e.data.response.addToWhishlist){
          wishCount.innerHTML = parseInt(wishCount.innerHTML) + 1;

    }
    console.log(e);
  });
}

function deleteFromWish(proId){
  axios.get('deleteFromWish/'+proId).then(e =>{

    console.log(e);
    
    location.reload()
  })
}