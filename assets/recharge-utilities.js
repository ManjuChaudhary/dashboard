var existingProductIds=[];
 class rechargeUtilities {
    /*
      * General Functions
      * If you want to use specific version API then pass X-Recharge-Version : ‘Version’ : https://d.pr/i/G2Y89I
       *  By default , it takes version from Api Manager : https://d.pr/i/hVvXhh
    */
    header() {
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Shop": window.customerDetails.url,
            "X-Recharge-Version": "2021-11"
        };
    }
    //For using recharge APIs
    rechargeCommonApi(){
        return window.customerDetails.rechargeCommonApi
    }
    //For using shopify REST APIs
    shopifyCommonApi(){
        return window.customerDetails.shopifyCommonApi
    }
    //Common Recharge Body
    rechargeCommonBody(config){
        return {
            method: 'POST',
            headers: this.header(),
            body: JSON.stringify(config)
        }
    }
    /**
    Get Customer details of the recharge 
   * Customer can be fetched in two ways
   * 1. @param {String} - email - Email Address of the recharge customer
   * 2. @param {Number|String} - customer_id - Recharge Id of the customer ( Not shopify customer id )
   * We need to fetch the recharge customer details by email as we don't have recharge customer id on page load
   * @return  {JSON} - data.customers[0]
   * For more information : https://developer.rechargepayments.com/2021-11/customers/customers_retrieve
  */
  async _getCustomerDetails() {
      var config = {
          url: `/customers`, 
          method: 'GET',
          data: {
              'email': window.customerDetails.email
          }
      };
      const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
      const data = await response.json();
      // Customer Details
      window.customerDetails.rechargeCustomerDetails=data.customers[0]
      if (response.ok) {
          console.log('Recharge Customer Details ===>',data) 
          return await data;
      }else{
          console.error('Error in fetching customer details ===>',data)
          alert('something went wrong');
      }
    }

    /**
  Fetch All Subscriptions of logged in customer
  * @param {Number|String} - customer_id - Recharge Id of the customer
  * @return  {JSON} - data.subscriptions
  * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_list
  */
  async _getSubscriptions() {
    var config = {
        url: `/subscriptions`,
        method: 'GET',
        data: {
            'customer_id': window.customerDetails.rechargeCustomerDetails.id
        }
    };
    const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
    const data = await response.json();
    // console.log(data);
    // All Subscriptions
    window.customerDetails.rechargeSubscriptions=data.subscriptions;
    // existingProductIds=[...existingProductIds,...data.subscriptions.map((sub)=>{return sub.external_product_id.ecommerce})]
    // console.log(existingProductIds);
    if (response.ok) {
        console.log('Subscriptions ===>',data)
        return await data;
    }else{
        console.error('Error in fetching subscriptions ===>',data)
        alert('something went wrong');
     }
   }

   /**
      Fetch All Recharge Addresses of logged in customer
     * @param {Number|String} - customer_id - Recharge Id of the customer
     * @return  {JSON} - data.addresses
     * For more information : https://developer.rechargepayments.com/2021-11/addresses/list_addresses
    */
      async _getCustomerAddresses() {
        var config = {
            url: `/addresses`,
            method: 'GET',
            data: {
                'customer_id': window.customerDetails.rechargeCustomerDetails.id
            }
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Recharge Customer Addresses
        window.customerDetails.rechargeCustomerAddress=data.addresses;
        if (response.ok) {
            console.log('Addresses ===>',data)
            return await data;
        }else{
            console.error('Error in fetching Addresses ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Fetch All Registered payment methods of logged in customer
     * @param {Number|String} - customer_id - Recharge Id of the customer
     * @return  {JSON} - data.payment_methods
     * For more information : https://developer.rechargepayments.com/2021-11/payment_methods/payment_methods_list
  */
  async _getPaymentMethods() {
    var config = {
        url: `/payment_methods`,
        method: 'GET',
        data: {
            'customer_id': window.customerDetails.rechargeCustomerDetails.id
        }
    };
    const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
    const data = await response.json();
    // Recharge Payment Methods
    window.customerDetails.rechargePaymentMethods=data.payment_methods;
    if (response.ok) {
        console.log('PaymentMethods ===>',data)
        return await data;
    }else{
        console.error('Error in fetching PaymentMethods ===>',data)
        alert('something went wrong');
    }
}

/**
      Fetch Delivery Schedule
     * @param {Number|String} - customer_id - Recharge Id of the customer
     * @param {String} - future_interval - default: 90, max=365
     * @return  {JSON} - data.deliveries
     *   For more information : https://developer.rechargepayments.com/2021-11/customers/customer_delivery_schedule
    */
      async _getDeliverySchedule(){
        var config = {
            url: `/customers/${window.customerDetails.rechargeCustomerDetails.id}/delivery_schedule?future_interval=365`, 
            method: 'GET'
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Customer Delivery Schedule
        window.customerDetails.rechargeDeliverySchedule = data.deliveries;
        if (response.ok) {
            console.log('Delivery Schedule ===>',data)
            return await data;
        }else{
            console.error('Error in fetching Delivery Schedule ===>',data)
            alert('something went wrong');
        }
    }

    _formatDate(date, format) {
        date = new Date(date);
        var newDate;
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        var m = date.getMonth();

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        if (format == 'YYYY-MM-DD') {
            newDate = `${year}-${month}-${day}`
            return newDate;
        }

        if (format == 'M DD, YYYY') {
            newDate = `${months[m]} ${day}, ${year}`
            return newDate;
        }

    }


  }
  var RechargeUtilities = new rechargeUtilities();