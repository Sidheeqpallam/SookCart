
function addToCart(proid, userId) {
  const cartCount = document.getElementById("cartCount");
  if (userId) {
    axios.post("/addToCart/" + proid, { user: userId }).then((res) => {
      if (res.status == 200) {
        cartCount.innerHTML = res.data.cartCount[0].count;
      }
    });
  } else {
    swal("Please Sign In", "", "error");
  }
}

function deleteCartItem(proId) {
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
  });
}

function deleteFromWish(proId){
  axios.get('deleteFromWish/'+proId).then(e =>{
    location.reload()
  })
}

const objectToCsv = function(data){
  const csvRows =[];
  //get the headers 
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));

  //loop over the rows

  for (const row of data){
    const values =  headers.map(header =>{
      const escaped = (''+row[header]).replace(/"/g, '\\"')
      return `"${escaped}"`
    })
    csvRows.push(values.join(',')) 
  }
  return csvRows.join('\n')
}

const download = function(data){
  const blob = new Blob([data], {type : 'text/csv'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'download.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

}


async function downloadSalesReport(){
  const url = '/admin/getSalesReport';
  const res = await fetch(url);
  const json = await res.json();
  const data = json.map(row =>({
    Product_id : row.Product_id,
    Product_Name : row.Product_Name,
    Category : row.Category,
    Customer_id : row.Customer_id,
    Customer : row.Customer,
    Tax_rate : row.Tax_rate,
    Tax : row.Tax,
    Total : row.Total,
    Discount_rate : row.Discount_rate,
    Discount : row.Discount,
    Discount_Price : row.Discount_Price,
    Coupon : row.Coupon,
    Coupon_Discount : row.Coupon_Discount,
    Quantity : row.Quantity,
    Grand_Total : row.Grand_Total
  }));
  const csvData = objectToCsv(data);
  download(csvData)
}