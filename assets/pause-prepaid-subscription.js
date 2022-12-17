var customerDetails={};
var allSubscrptions=[];
var activePrepaidSubscrptions=[];
var subscription ="";
var existingProductIds=[];
var graphQLJson =[];
var allOrders = [];
var is_prepaid_Orders = "";

class dashboard{
    constructor(){
        this.dashboard=document.querySelector('[data-dashboard]');
        this.header={
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-Shop": window.location.origin.split('//')[1],
        }

        this.version={
            "X-ReCharge-Version": "2021-11",
        }

        this._getCustomerDetails();
        // this._getProductsJsonByGraphQl();
    }

   //Get Customer Data
   _getCustomerDetails(){
    const _this=this;
    var config = {
        url: `/customers?email=himali@hulkapps.com`,
        method: 'GET',
        data:[]
    };
    fetch('/tools/ha-api/recharge/common', {
        method: 'POST',
        headers: this.header,
        body: JSON.stringify(config),
    }).then(function (response) {
        // The API call was successful!
        return response.json();
    }).then(function (data) {
        customerDetails=data.customers[0];
        _this._getSubscriptions();
        
        // This is the JSON from our response
    }).catch(function (err) {
        // There was an error
        console.log('Something went wrong.', err);
    });
};

 //get subscriptions
 async _getSubscriptions(){
    const _this=this;
    let productsArr=[];
    allSubscrptions=[];
    console.log("customerDetails",customerDetails.id)
    activePrepaidSubscrptions = [];
    var config = {
        url: `/subscriptions?customer_id=${customerDetails.id}`,
        method: 'GET',
        data: []
    };
    await  fetch('/tools/ha-api/recharge/common', {
        method: 'POST',
        headers: this.header,
        body: JSON.stringify(config)
    }).then(function (response) {
        // The API call was successful!
        return response.json();

    }).then(async function (data) {
        allSubscrptions=data.subscriptions;
        existingProductIds=[...existingProductIds,...data.subscriptions.map((sub)=>{return sub.external_product_id.ecommerce})]
        console.log(existingProductIds);
        allSubscrptions.filter((subscription) => {
            if(subscription.status == 'active' && subscription.is_prepaid == true )
            {
                 _this.activePrepaidSubscrptionsHTML(subscription);
                 console.log(subscription);
            }
        })

    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });
}; 


    
/*
Active susbcriptionHtml
*/
async activePrepaidSubscrptionsHTML(subscription){
    console.log(graphQLJson);
    console.log(subscription.external_product_id.ecommerce);
        console.log(subscription.next_charge_scheduled_at);
        console.log(subscription.order_interval_frequency);
        console.log(subscription.order_interval_unit);
        let new_next_charge_date=moment(subscription.next_charge_scheduled_at, "YYYY-MM-DD").add(subscription.order_interval_frequency, subscription.order_interval_unit);
        console.log(new_next_charge_date);
        var style =this._activeHTML(subscription , new_next_charge_date);
        document.querySelector("[data-active-subscriptions]").innerHTML = style;
        document.querySelector("[data-active-subscriptions]").classList.remove("d-none");
        document.querySelector('[data-loader_button]').classList.add('d-none');
        this.onLoadEvents(subscription.id, subscription.order_interval_frequency, subscription.order_interval_unit , new_next_charge_date);
        return style;
        
       
        }
        _activeHTML(subscription, new_next_charge_date){
        return `
        <div class="recharge-active" data-single-active-subscription="${subscription.id}" data-subscription-id="${subscription.id}">
                <div class="border border-gray-100 pt-5 px-5 mt-5">
                    <div class="row align-items-md-center mx-0">
                        <div class="col-md-4 col-12 mb-md-0 mb-5 px-0">
                            <div class="d-flex align-items-center">
                            <div class="order-image pe-3">
                               
                            </div>
                            <div class="order-image-info pe-md-7">
                                <p class="font-size-md fw-normal ls-sm text-primary mb-2">#${subscription.id}</p>
                                <h6 class="font-family-base text-black fw-semibold ls-0 mb-0 text-capitalize" style="font-size: 17px;">${subscription.product_title}</h6>
                               
                            </div>
                            </div>
                        </div>
                        <div class="col-md-2 col-6 mb-md-0 mb-5 px-0">
                            <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">QTY</p>
                            <p class="font-size-xl fw-normal text-black ls-0 mb-0 text-capitalize">Active</p>
                        </div>
                        <div class="col-md-3 col-6 mb-md-0 px-0">
                            <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">NEXT SHIPMENT</p>
                            <p class="font-size-xl fw-normal text-black ls-0 mb-0">${subscription.next_charge_scheduled_at != null ?  moment(subscription.next_charge_scheduled_at).format('MMMM DD, YYYY') : '- - -'}</p>
                        </div>
                        <div class="col-md-1 col-6 mb-md-0 px-0">
                            <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">TOTAL</p>
                            <p class="font-size-xl fw-normal text-black text-md-center ls-0 mb-0">${Shopify.formatMoney(subscription.price * subscription.quantity * 100, window.globalVariables.money_format)}</p>
                        </div>
                        <div class="col-md-2 col-6 text-md-end px-0">
                            <a href="#" class="btn btn-primary skip_subscription" data-updated-next-charge-date="${moment(new_next_charge_date).format('YYYY-MM-DD')}"><span class="add-text">Skip Next Shippment</span><span class="spinner"></span></a>
                            <div class="upcoming-skip_info text-center px-4 px-md-0 d-none">
                                  <p class="font-size-md lh-sm mb-3 mt-2 pt-1">
                                       Your upcoming order on  <span data-current_charge_date=""><span>${moment(subscription.next_charge_scheduled_at).format('MMMM DD, YYYY')}</span> will be skipped.
                                  </p>
                                  <p class="font-size-md pt-1 lh-sm mb-0"> Your next order will be processed on <b><span data-new_next_chargedate="">${moment(new_next_charge_date).format('MMMM DD, YYYY')}</span></b>.</p>
                              </div>
                        </div>
                        
                </div>
        </div>
        `;
}

/*
Onload Events for bins the events 
*/
async onLoadEvents(subId, subFre, subInterval,new_next_charge_date){
    let _this = this;
    document.querySelectorAll(".skip_subscription").forEach(element => {
        element.addEventListener("click" , function(){
            console.log("skip_clicked");
            _this._getorders(subId, subFre, subInterval,new_next_charge_date);
        });
    });
}

 /*get Customers Orders 
 Pass customer Id and get all the orders.
 */

 async _getorders(subId, subFre, subInterval,new_next_charge_date){
    const _this=this;
    console.log("customerDetails",customerDetails.id)
    var config = {
        url: `/orders?customer_id=${customerDetails.id}`,
        method: 'GET',
        data: []
    };
    await  fetch('/tools/ha-api/recharge/common', {
        method: 'POST',
        headers: this.header,
        body: JSON.stringify(config)
    }).then(function (response) {
        // The API call was successful!
        return response.json();

    }).then(async function (data) {
      allOrders = data;
      _this.getPrepaid_orders(subId, subFre, subInterval, new_next_charge_date, allOrders);
    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });
}; 

/*
Get All prepaid Order.
Need to check the order prepaid status and unfullfilled status
Get Order Id and Order schedule Date.
*/
async getPrepaid_orders(subId, subFre, subInterval,new_next_charge_date, allOrders){
    console.log(allOrders);
    console.log(subId);
    console.log(new_next_charge_date);
    let _this = this;
    let allordersobj = allOrders.orders;
    let allPrepaid_orders = [];
    let allprepaidOrdeidChargeId = [];
    for(var i=0; i< allordersobj.length; i++ ){
        console.log(allordersobj[i]);
        allPrepaid_orders = allordersobj[i].is_prepaid;
        if(allPrepaid_orders == true && allordersobj[i].status == 'queued'){
            allprepaidOrdeidChargeId.push(allordersobj[i].id);
            console.log(allordersobj[i].scheduled_at);
            let d = new Date(allordersobj[i].scheduled_at);
            let shedule_date = d.getFullYear()+"-02-0"+d.getDate();
            document.querySelector("[data-current_charge_date] span").innerHTML = shedule_date;
            console.log(shedule_date);
            let subscription_shiping_frequency=subFre;
            let subscription_shiping_unit =subInterval;
            console.log(subscription_shiping_frequency);
            console.log(subscription_shiping_unit);
            let new_shedule_date = moment(allordersobj[i].scheduled_at, "YYYY-MM-DD").add(subscription_shiping_frequency, subscription_shiping_unit);
            console.log(new_shedule_date);
            document.querySelector("[data-new_next_chargedate]").innerHTML = new_shedule_date;
            this._skip_shippment(allordersobj[i].id , new_shedule_date);
            console.log(moment(allordersobj[i].scheduled_at, "YYYY-MM-DD"));

            // Set CHARGE Date
        }
    }
    let subscription_id = subId;
    console.log(subscription_id);
    let subscription_charge_date = new_next_charge_date;
    console.log(subscription_charge_date);
    //this._updateChargeDate(subscription_id, subscription_charge_date);
    console.log(allprepaidOrdeidChargeId);
}


/*
Update Charge date of subscription 
Need subscription Id and Subscription updated Next Charge Date
*/
async _updateChargeDate(subId, new_next_charge_date){
    console.log(subId);
    console.log(new_next_charge_date);
    var config = {
            url: `/subscriptions/${subId}/set_next_charge_date`,
            method: 'POST',
            data: {
                'date': new_next_charge_date
            }
    };
    await  fetch('/tools/ha-api/recharge/common', {
        method: 'POST',
        headers: this.header,
        body: JSON.stringify(config)
    }).then(function (response) {
        // The API call was successful!
        return response.json();

    }).then(async function (data) {
        console.log('Update Charge Date successfully ===>',data)
            return await true;
    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });
}

/*
Skip Shippment
Use Order Api With Order ID AND update the Order Schedule with new Updated Schedule.
*/
async _skip_shippment(order_id , new_shedule_date){
    console.log(order_id);
    console.log(new_shedule_date);
    var config = {
            url: `/orders/${order_id}`,
            method: 'PUT',
            data: {
                'scheduled_at': new_shedule_date
            }
    };
    await  fetch('/tools/ha-api/recharge/common', {
        method: 'PUT',
        headers: this.header,
        body: JSON.stringify(config)
    }).then(function (response) {
        // The API call was successful!
        return response.json();

    }).then(async function (data) {
        console.log('Skip order successfully ===>',data)
        // document.querySelector(".upcoming-skip_info").classList.remove("d-none");
            return await true;
    }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
    });
}



}

new dashboard();

