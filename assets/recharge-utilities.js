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
      console.log(config);
      const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
      console.log(response);
      const data = await response.json();
      console.log(data);
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
    existingProductIds=[...existingProductIds,...data.subscriptions.map((sub)=>{return sub.external_product_id.ecommerce})]
    console.log(existingProductIds);
    if (response.ok) {
        console.log('Subscriptions ===>',data)
        return await data;
    }else{
        console.error('Error in fetching subscriptions ===>',data)
        alert('something went wrong');
     }
   }

    /**
      Fetch Shopify Product variants price and images by GRAPHQL call
     * @param {String} - ids - Recharge Id of the customer (Example : {'ids' : '632910392,63291234,63212347'}  )
     * @return  {JSON} - data.products
    */
      async _getProductsJsonByGraphQl() {
        let query="";
        for (const id of existingProductIds) {
            console.log(existingProductIds);
            let tempQuery=`
                product_${id.toString()}: product(id: "gid://shopify/Product/${id}") {
                    id
                    handle
                    images(first: 20) {
                        edges {
                            node {
                            src
                            }
                        }
                    }
                    variants(first: 99) {
                        edges {
                            node {
                            id
                            price
                                image {
                                    src
                                }
                            }
                        }
                    }
                }
            `;
            query+=tempQuery;
          console.log(JSON.stringify({query : `{${query}}`})
        }
        const response = await fetch('/api/2021-07/graphql.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Origin": "*",
                'X-Shopify-Storefront-Access-Token': "ddf7228b3e428ffe625a44f5862e3593"
            },
            body: JSON.stringify({query : `{${query}}`}),
        })
        const data = await response.json();
        let tempData=data.data;
        let tempGraphQLjson={};
        for (const key in tempData) {
            let id=key.split('product_')[1];
            let handle=tempData[key].handle;
            let obj={
                id,
                handle,
                images: {},
                variants:{}
            };
            var images=tempData[key].images.edges.map((img)=>{
                return img.node;
            })
            obj['images']=images;
            let variants=tempData[key].variants.edges.map((variant)=>{
                variant=variant.node;
                let variantObj={
                    id: atob(variant.id).replace('gid://shopify/ProductVariant/',''),
                    image: variant.image,
                    price: variant.price
                }
                return variantObj;
            })
            obj['variants']=variants
            tempGraphQLjson[id]=obj
        }
        window.customerDetails.graphQLProductsJSON=tempGraphQLjson;
        return await tempGraphQLjson;
    }
    
      /**
      Fetch Shopify Products JSON of subscription products
      
     * @param {String} - ids - Recharge Id of the customer (Example : {'ids' : '632910392,63291234,63212347'}  )
     
     * @return  {JSON} - data.products
     
     * For more information : https://shopify.dev/api/admin-rest/2022-07/resources/product#get-products
    */

      async _getProductsJSON() {
        let rechargeOnetimes=window.customerDetails.rechargeOnetimes.map((sub)=>{return sub.external_product_id.ecommerce});

        var config = {
            url: `/products.json`,
            method: 'GET',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key8,
            data: {
                'ids': rechargeOnetimes.toString()
            }
        };
        const response = await fetch(this.shopifyCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();

        var productsJson = [];
        productsJson = data.products;
        let obj = {};
        productsJson.map((item, i) => {
            obj[item.id] = item;
        });
        productsJson = obj;
        
        // All Shopify Products JSON
        window.customerDetails.shopifyProductsJSON=productsJson;
        if (response.ok) {
            console.log('Products Json ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Please try again later','error')
            console.error('Error in fetching products JSON===>',data)
            alert('something went wrong');
        }
    }

     /**
      Fetch Shopify Products JSON of subscription products
      
     * @param {String} - ids - Recharge Id of the customer (Example : {'ids' : '632910392,63291234,63212347'}  )
     
     * @return  {JSON} - data.products
     
     * For more information : https://shopify.dev/api/admin-rest/2022-07/resources/product#get-products
    */ 

      async _getStoreFrontProductJSON(handle) {
        const response = await fetch(`/products/${handle}.js`);
        const data = await response.json() ;

        if (response.ok) {
            console.log('Products Json ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Please try again later','error')
            console.error('Error in fetching product JSON===>',data)
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
      Change Shipping Address
     * @param {Number|String} - addressId 
     * @param {Number|String} - updatedAddressObj - can be change shipping address / Shipping charge / Apply discount / remove discount
      Take reference from : https://developer.rechargepayments.com/2021-11/addresses/update_address
     * @return  {JSON} - data
    */
      async _changeShippingAddress(addressId,updatedAddressObj){
        var config = {
            url: `/addresses/${addressId}`,
            method: 'PUT',
            data: updatedAddressObj
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Update shipping address
        if (response.ok) {
            console.log('Address Updated Successfully ===>',data)
            return await true;
        }else if(response.status == 422){
            alert(data.errors.province)
        }else{
            console.error('error in updating address ===>',data)
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

    /**
    Fetch All Onetime Addons of logged in customer
   * @param {Number|String} - customer_id - Recharge Id of the customer
   * @return  {JSON} - data.onetimes
   * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_list
  */
  async _getOnetimes() {
    var config = {
        url: `/onetimes`,
        method: 'GET',
        data: {
            'customer_id': window.customerDetails.rechargeCustomerDetails.id
        }
    };
    const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
    const data = await response.json();
    // Recharge Onetimes Addons
    window.customerDetails.rechargeOnetimes=data.onetimes;
    existingProductIds=[...existingProductIds,...data.onetimes.map((sub)=>{return sub.external_product_id.ecommerce})]
    existingProductIds=this.getUniqueValues(existingProductIds)
    if (response.ok) {
        console.log('Onetimes ===>',data.onetimes)
        return await data;
    }else{
        console.error('Error in fetching onetimes ===>',data)
        alert('something went wrong');
    }
}

/**
      Update One-time Addon 
     * @param {Number|String} - addon_id - Addon Id
     * @param {JSON} - addonObj - can be change charge date / Address Id / Price / Quantity
     * @return  {JSON} - data
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_update
    */
      async _updateOnetimeAddon(addon_id,addonObj){
        var config = {
            url: `/onetimes/${addon_id}`,
            method: 'PUT',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key19,
            data: addonObj
        };
        console.log(addonObj);
        console.log(addon_id);
        console.log(config);
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Updated onetime addon
        if (response.ok) {
            console.log('updated onetime addon Successfully ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in Updating onetime Addon','error')
            console.error('error in updating onetime Addon ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Remove One-time Addon 

     * @param {Number|String} - addon_id - Addon Id
     
    
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_delete
    */
      async _removeOnetimeAddon(addon_id){
        var config = {
            url: `/onetimes/${addon_id}`,
            method: 'DELETE',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key20,
        };

        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));

        // Remove onetime addon
        if (response.ok) {
            console.log('Remove Addon Successfully ===>',response)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in Removing onetime Addon','error')
            console.error('error in Removing Addon ===>',data)
            alert('something went wrong');
        }
    }

       /**
      Create subscription product 
     * @param {JSON} - subsDataObj - need to pass shopify product id , address id, frequency, frequency unit, qty
     * @return  {JSON} - data
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_create
    */
      async _createSubscriptionProduct(subsDataObj){
        var config = {
            url: `/subscriptions`,
            method: 'POST',
            data: subsDataObj
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Added onetime addon
        if (response.ok) {
            console.log('Subscription created Successfully ===>',data)
            return await data
        }else{
            console.error('error in adding onetime Addon ===>',data)
            alert('something went wrong');
        }
    }
    /**
      Add One-time Addon
     * @param {JSON} - addonObj - need to pass shopify product id , shopify variant id and address id
     *Note* : Add to next charge : https://d.pr/i/tRC129 => if you set the true , then addon date should be added with first upcoming charge date in specified address id
            if you want to set manual charge date then you need to pass : https://d.pr/i/m2vYID , but you can use both these param
     * @return  {JSON} - data
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_create
    */
    async _createOnetimeAddon(addonObj){
        var config = {
            url: `/onetimes`,
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key18,
            data: addonObj
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Added onetime addon
        if (response.ok) {
            console.log('Addon added Successfully ===>',data)
            return await data
        }else{
            Utility.notification('Something went wrong','Error in Adding onetime Addon','error')
            console.error('error in adding onetime Addon ===>',data)
            alert('something went wrong');
        }
    }

/**
      Reactivate Subscriptions
     * @param {Number|String} - subscription_id
     * @return  {JSON} - data
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_activate
    */
      async _reActivateSubscription(subscription_id){
        var config = {
            url: `/subscriptions/${subscription_id}/activate`,
            method: 'POST',
            data: {}
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Reactivate Subscription
        if (response.ok) {
            console.log('Reactivate successfully ===>',data)
            return await data;
        }else{
            console.error('error in Reactivating subscription ===>',data)
            alert('something went wrong');
        }
    }

    /**
        Cancel Subscriptions
       * @param {Number|String} - subscription_id
       * @param {String} - cancellation_reason
       * @param {String} - cancellation_reason_comments 
       * @return  {JSON} - data
       * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_cancel
      */
        async _cancelSubscription(subscription_id,reason,feedback){
            var config = {
                url: `/subscriptions/${subscription_id}/cancel`,
                method: 'POST',
                data: {
                    cancellation_reason: reason,
                    cancellation_reason_comments: feedback
                }
            };
            const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
            const data = await response.json();
            // Cancelled subscription
            if (response.ok) {
                console.log('Cancel successfully ===>',data)
                return await true;
            }else{
                console.error('error in cancelling subscription ===>',data)
                alert('something went wrong');
            }
        }

        /**
      Retention Strategies
      Take reference from : https://developer.rechargepayments.com/2021-11/retention_strategies/retention_strategies_list
     * @return  {JSON} - data
    */
     async _listRetentionStrategies(){
        var config = {
            url: `/retention_strategies`,
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key23,
            method: 'GET'
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Updated subscription
        if (response.ok) {
            console.log('List of Retention Strategies  ===>',data.retention_strategies)
            return await data.retention_strategies;
        }else{
            Utility.notification('Something went wrong','Please try again later','error')
            console.error('error in Listing Retention Strategies ===>',data)
            alert('something went wrong');
        }
    }
    
     /**
      Update Subscription
     * @param {Number|String} - subscription_id 
     * @param {Number|String} - updateSubscriptionObj - can be change Subscription price / Shipping Frequency / Product / variant
      Take reference from : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_update
     * @return  {JSON} - data
     *Note*: For changing Subscription Frequency , must need to pass these three parameters : https://d.pr/i/y32aVI 
    */
     async _updateSubscription(subscription_id,updateSubscriptionObj){
        var config = {
            url: `/subscriptions/${subscription_id}`,
            method: 'PUT',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key16,
            data: updateSubscriptionObj
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Updated subscription
        if (response.ok) {
            console.log('Subscription Updated Successfully ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in Updating subscription','error')
            console.error('error in updating subscription ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Remove One-time Addon 
    * @param {JSON} - addonsList - Addon ID Object to delete addons
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_delete
    */
      async _cancelOnetimeAddon(addonsList){
        let promises = [];
        for (let addon of addonsList) {
            let config = {
                url: `/onetimes/${addon.id}`,
                method: 'DELETE',
                timestamp: window.APImanagerKey.timeStamp,
                hash: window.APImanagerKey.key21,
            };
            const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
            promises.push(response);
        };
        const response = await Promise.all(promises);
        if(response){
            return await data;
        }
    }
    
       /**
      Send Mail-Notification For Updating Payment Method to customer
     * @param {Number|String} - Customer Id 
     * @param {String} - type - email
     * @param {String} - template_type - shopify_update_payment_information
     For more information : https://developer.rechargepayments.com/2021-11/notifications/notifications_send
    */
     async _updatePaymethodMethod(){
        var config = {
            url: `/customers/${window.customerDetails.rechargeCustomerDetails.id}/notifications`,
            method: 'POST',
            data: {
                'type': 'email',
                'template_type': 'shopify_update_payment_information'
            }
        };
        console.log(config);
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        // Mail Notification
        if (response.ok) {
            console.log('Sent Mail-Notification to the customer ===>',response)
            console.log(config);
            return await true;
        }else{
            console.warn('There is some error in sending mail notification===>',response)
            alert('something went wrong');
        }
    }


    /**
      Change Charge Date
     * @param {Date} - next_charge_date {Format : 'YYYY-MM-DD'} - (Date must be future date)
     * @return  {JSON} - data
     * For more information : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_change_next_charge
    */
      async _changeChargeDate(subscription_id,next_charge_date){
        var config = {
            url: `/subscriptions/${subscription_id}/set_next_charge_date`,
            method: 'POST',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key11,
            data: {
                'date': next_charge_date
            }
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Updated Charge Date
        if (response.ok) {
            console.log('updated charge date successfully ===>',data)
            return await true;
        }else{
            Utility.notification('Something went wrong','Error in updating charge date','error')
            console.error('error in updating charge date ===>',data)
            alert('something went wrong');
        }
    }

    /**
      Update One-time Addon 
     * @param {Number|String} - addon_id - Addon Id
     * @param {JSON} - addonObj - can be change charge date / Address Id / Price / Quantity
     * @return  {JSON} - data
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_update
    */
      async _changeChargeDateAddon(addonsList,newChargeDate){
        let promises = [];
        for (let addon of addonsList) {
            var addonObj={
                'commit_update': true,
                'next_charge_scheduled_at': newChargeDate
            }
            var config = {
                url: `/onetimes/${addon.id}`,
                method: 'PUT',
                timestamp: window.APImanagerKey.timeStamp,
                hash: window.APImanagerKey.key12,
                data: addonObj
            };
            promises.push(await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config)));
        }
        const response = await Promise.all(promises);
        if(response){
            return await data;
        }
    }

    /**
      Update One-time Addon 
     * @param {Number|String} - addon_id - Addon Id
     * @param {JSON} - addonObj - can be change charge date / Address Id / Price / Quantity
     * @return  {JSON} - data
     * For more information : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_update
    */
      async _changeChargeDateAddon(addonsList,newChargeDate){
        let promises = [];
        for (let addon of addonsList) {
            var addonObj={
                'commit_update': true,
                'next_charge_scheduled_at': newChargeDate
            }
            var config = {
                url: `/onetimes/${addon.id}`,
                method: 'PUT',
                timestamp: window.APImanagerKey.timeStamp,
                hash: window.APImanagerKey.key12,
                data: addonObj
            };
            promises.push(await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config)));
        }
        const response = await Promise.all(promises);
        if(response){
            return await data;
        }
    }

     /**
      Update Subscription
     * @param {Number|String} - subscription_id 
     * @param {Number|String} - updateSubscriptionObj - can be change Subscription price / Shipping Frequency / Product / variant
      Take reference from : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_update
     * @return  {JSON} - data
     *Note*: For changing Subscription Frequency , must need to pass these three parameters : https://d.pr/i/y32aVI 
    */
     async _updateSubscription(subscription_id,updateSubscriptionObj){
        var config = {
            url: `/subscriptions/${subscription_id}`,
            method: 'PUT',
            timestamp: window.APImanagerKey.timeStamp,
            hash: window.APImanagerKey.key16,
            data: updateSubscriptionObj
        };
        const response = await fetch(this.rechargeCommonApi(), this.rechargeCommonBody(config));
        const data = await response.json();
        // Updated subscription
        if (response.ok) {
            console.log('Subscription Updated Successfully ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Error in Updating subscription','error')
            console.error('error in updating subscription ===>',data)
            alert('something went wrong');
        }
    }
    /**
      Fetch Shopify Products JSON of subscription products
     * @param {String} - ids - Recharge Id of the customer (Example : {'ids' : '632910392,63291234,63212347'}  )
     * @return  {JSON} - data.products
     * For more information : https://shopify.dev/api/admin-rest/2022-07/resources/product#get-products
    */ 
    async _getStoreFrontProductJSON(handle) {
        const response = await fetch(`/products/${handle}.js`);
        const data = await response.json() ;
        if (response.ok) {
            console.log('Products Json ===>',data)
            return await data;
        }else{
            Utility.notification('Something went wrong','Please try again later','error')
            console.error('Error in fetching product JSON===>',data)
            alert('something went wrong'); 
        }
    }


    /* Genral Function */

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
     
    getUniqueValues(arr){
        return [... new Set(arr)]
    }

    


  }
  var RechargeUtilities = new rechargeUtilities();