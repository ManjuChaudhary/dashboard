  var allSubscriptions = "";
  var graphQLProductsJSON = null;
  var allSubscriptionCustomerAddress = "";
  var allPayments = "";
  var deliverySchedules = "";
  class dashboard extends HTMLElement {
    constructor () {
        super();
        this.dashboard = this;
        //Get OnLoad Details With Customers
        this.getLoadDetails();
    } 
    async getLoadDetails(){
        //Get Customer Details
        await RechargeUtilities._getCustomerDetails();
        await this.onLoadData();
    }
    async onLoadData() {
        if (window.customerDetails.rechargeCustomerDetails) {
            //Get Subscriptions
            await RechargeUtilities._getSubscriptions(); 
            //Get Customer Addresses
            await RechargeUtilities._getCustomerAddresses(); 
            //Get Customer Payment
            await RechargeUtilities._getPaymentMethods();
            //Get Customer Delivery Details
            await RechargeUtilities._getDeliverySchedule();
          
        }
         //Get GraphQL Products JSON
        //  await RechargeUtilities._getProductsJsonByGraphQl(); 
        await this._createSubscriptionsHTML(); 
        await this._createAddressHtml();
        await this._createPayemntHTML();
        await this._createDeliveryScheduleHTML();
    }
    _createSubscriptionsHTML(){
      allSubscriptions = window.customerDetails.rechargeSubscriptions;
      graphQLProductsJSON = window.customerDetails.graphQLProductsJSON;
      console.log(graphQLProductsJSON);
      
      let activeSubscriptionHTML = "";
      let inActiveSubscription = "";
      for( var sub of allSubscriptions )
      {
        let status = sub.status;
        if(status == "active"){
          activeSubscriptionHTML +=   
          `<div class="recharge-active " data-single-active-subscription="300948901" data-subscription-id="300948901">
           <div class="border border-gray-100 py-3 px-5 mt-5">
            <div class="row align-items-md-center mx-0">
                <div class="col-md-4 col-12 mb-md-0 mb-5 px-0">
                    <div class="d-flex align-items-center">
                    <div class="order-image pe-3">
                        <img src="https://cdn.shopify.com/s/files/1/0647/5835/0068/products/tea1.png?v=1653913558" alt="${sub.product_title}" class="recharge-img mw-100 me-3">
                    </div>
                    <div class="order-image-info pe-md-7">
                        <p class="font-size-md fw-normal ls-sm text-primary mb-2">#${sub.id}</p>
                        <h6 class="font-family-base text-black fw-semibold ls-0 mb-0 text-capitalize" style="font-size: 17px;">${sub.product_title}</h6>
                        <p>1 x ${Shopify.formatMoney(sub.price)}</p>
                    </div>
                    </div>
                </div>
                <div class="col-md-2 col-6 mb-md-0 mb-5 px-0">
                    <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">QTY</p>
                    <p class="font-size-xl fw-normal text-black ls-0 mb-0 text-capitalize">${sub.status}</p>
                </div>
                <div class="col-md-3 col-6 mb-md-0 px-0">
                    <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">NEXT SHIPMENT</p>
                    <p class="font-size-xl fw-normal text-black ls-0 mb-0">${sub.next_charge_scheduled_at != null ?  moment(sub.next_charge_scheduled_at).format('MMMM DD, YYYY') : this._checkChargeError(sub)}</p>
                </div>
                <div class="col-md-1 col-6 mb-md-0 px-0">
                    <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">TOTAL</p>
                    <p class="font-size-xl fw-normal text-black text-md-center ls-0 mb-0">${Shopify.formatMoney(sub.price)}</p>
                </div>
            </div>
            
        </div>
    </div>`
    // console.log(activeSubscriptionHTML);
    document.querySelector(".recharge-active-subscription").innerHTML = activeSubscriptionHTML;
     
    }
    if(status == "cancelled"){
      inActiveSubscription +=
      `<div class="border recharge-inactive recharge-item" data-single-inactive-subscription="300949011">
      <div class="row align-items-md-center mx-0 recharge-item-wrapper">
        <div class="col-md-4 col-12 mb-md-0 mb-5 px-0">
          <div class="d-flex align-items-center">
            <div class="order-image pe-3">
              <img src="https://cdn.shopify.com/s/files/1/0647/5835/0068/products/coffee-subscription-box.jpg?v=1653913544" alt="${sub.product_title}" class="recharge-img mw-100 me-3">
            </div>
            <div class="order-image-info pe-md-7">
              <p class="font-size-md fw-normal ls-sm text-primary mb-2">#${sub.id}</p>
              <h6 class="font-family-base text-black fw-semibold ls-0 mb-0 text-capitalize" style="font-size: 17px;">${sub.product_title}</h6>
              <p>1 x ${Shopify.formatMoney(sub.price)}</p>
            </div>
          </div>
        </div>
        <div class="col-md-2 col-6 mb-md-0 mb-5 px-0">
          <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">QTY</p>
          <p class="font-size-xl fw-normal text-black ls-0 mb-0 text-capitalize">In - Active</p>
        </div>
        <div class="col-md-3 col-6 mb-md-0 px-0">
          <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">NEXT SHIPMENT</p>
          <p class="font-size-xl fw-normal text-black ls-0 mb-0">${sub.next_charge_scheduled_at}</p>
        </div>
        <div class="col-md-1 col-6 mb-md-0 px-0">
          <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">TOTAL</p>
          <p class="font-size-xl fw-normal text-black text-md-center ls-0 mb-0">${Shopify.formatMoney(sub.price)}</p>
        </div>
        <div class="col-md-2 col-6 text-md-end px-0">
          <a href="#" class="btn mb-1" data-reactive_subscription="">
            <span class="add-text">reactivate</span>
            <span class="spinner"></span>
          </a>
        </div>
      </div>
    </div>`
    document.querySelector(".recharge-reactivate-subscription").innerHTML = inActiveSubscription;
    }
   }
  }

  _createAddressHtml(){
    allSubscriptionCustomerAddress = window.customerDetails.rechargeCustomerAddress;
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
    let addressHTML = "";
    for( var addresses of allSubscriptionCustomerAddress ){
      addressHTML +=
      `<div class="col-sm-6 mb-4" data-single_customer_address="">
      <div class="card min-h-100 border-gray-200">
          <div class="card-body">
              <div class="card-title">
                  <h5 class="d-inline-block">
                  <span data-address_first_name=""> ${addresses.first_name} </span> 
                  <span data-address_last_name=""> ${addresses.last_name} </span>
                  </h5>
              </div>
              <div class="card-text">
                  <p data-address_1="" class="m-0"> ${addresses.address1} </p>
                  <p data-address_2="" class="m-0 ${addresses.address2 == null ? 'd-none' : ''}"> ${addresses.address2} </p>
                  <p class="m-0"><span data-address_city=""> ${addresses.city} </span> <span data-address_state="">${addresses.province}</span> <span data-address_pincode="">${addresses.zip}</span></p>
                  <p data-address_country="" class="m-0">${regionNames.of(addresses.country_code)}</p>
                  <p data-address_phone="" class="m-0 ${addresses.phone == null ? 'd-none' : ''}">PH: ${addresses.phone}</p>
              </div>
          </div>
          <div class="card-footer border-gray-200 bg-transparent">
              <a class="card-link" href="javascript:void(0);" data-toggle="modal" data-modal-opener="shippingaddress-modal" data-customer_address_id="${addresses.id}">Edit</a>
          </div>
      </div>
  </div>` 
    }
    this.dashboard.querySelector("[data-addresses]").innerHTML = addressHTML;
  }
  
  _createPayemntHTML(){
    allPayments = window.customerDetails.rechargePaymentMethods;
    let allPaymentsHtml = "";
    for( var payment of allPayments )
    {
      allPaymentsHtml += 
      `<div class="border mb-5 table-responsive" data-payment-id="#${payment.id}">
      <table table-responsive="true" class="table biiling_table">
          <tbody>
              <tr>
                  <td class="font-size-xl fw-semibold ls-sm">Card on File</td>
                  <td class="rc_text--base">
                      <p class="fw-medium mb-2" data-card-details=""><span class="text-capitalize" data-card-brand="">visa</span> ending in <span data-card-4digit="">${payment.payment_details.last4}</span></p>
                      <p class="fw-medium text-capitalize mb-2" data-card-exp-details="">Expires ${payment.payment_details.exp_month} / ${payment.payment_details.exp_year}</p>
                      <p class="d-none"><a href="#" data-update-card="" class="font-size-md fw-bold text-uppercase">Update Card</a></p>
                  </td>
              </tr>
              <tr>
                  <td>
                      <p class="font-size-xl fw-semibold ls-sm">Billing Information</p>
                  </td>
                  <td class="rc_text--base">
                      <p class="fw-normal ls-sm mb-0" data-original-billing-address="">
                          <span class="mb-2 d-block fw-medium" data-billing-name="">${payment.billing_address.first_name} ${payment.billing_address.last_name}</span>
                          <span class="mb-2 d-block fw-medium" data-billing-address1="">${payment.billing_address.address1}</span>
                          <span class="mb-2 d-block fw-medium" data-billing-province="">${payment.billing_address.province}</span>
                          <span class="mb-2 d-block fw-medium" data-billing-countryname="">${payment.billing_address.country}</span>
                      </p>
                      <p>
                          <a href="#" class="btn btn-fill ps-0" data-modal-opener="${payment.processor_name == 'shopify_payments' ? 'UpdatePayment-modal' : 'UpdateBraintreePayment-modal'}" data-payment-${payment.processor_name}>
                              <span class="add-text">Send update email</span>
                          </a>
                      </p>
                  </td>
              </tr>
          </tbody>
      </table>
  </div>`
    }
    this.dashboard.querySelector("[data-payemnt]").innerHTML = allPaymentsHtml;
  }
  
  _createDeliveryScheduleHTML(){
    deliverySchedules = window.customerDetails.rechargeDeliverySchedule;
        var deliveryScheduleHTML = ''        

        deliverySchedules.forEach((currentValue) => {
            
            var ds_date = RechargeUtilities._formatDate(currentValue.date, 'M DD, YYYY');
            
            // get all the products for a particular record
            var line_items_html = '';
            var line_items = currentValue.orders[0].line_items;
            var charge_id = currentValue.orders[0].charge_id;

            line_items.forEach((item) => {
                line_items_html += 
                `<tr>
                    <td> <img src="${item.images.small ? item.images.small : 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png'}" style="width:60px"> </td>
                    <td> 
                        ${item.is_skipped ? `Skipped: <span style="color: #8e8f8e">${item.product_title}</span>` : `${item.product_title}` }  
                    </td>
                    <td class="text-end"> ${item.quantity} </td>
                    <td class="text-end"> ${item.unit_price} </td>
                    <td class="text-center"> ${item.plan_type} </td>     
                    <td class="text-center"> 
                        ${(item.is_skippable && charge_id ) ? 
                            `<a href="#" class="fw-semibold btn" data-skipped="${item.is_skipped}" data-charge_id="${charge_id}"  data-item_id="${item.subscription_id}" data-date="${currentValue.date}" data-skip_unskip_delivery>
                                <span class="add-text">${item.is_skipped ? 'Unskip' : 'Skip' }</span> 
                                <span class="spinner"></span>
                            </a>` 
                        : ' ' }
                    </td>     
                </tr>`

            })

            // Main delivery schedule block HTML
            deliveryScheduleHTML += 
            `<div class="my-5">
                <div class="h5 mb-3">${ds_date}</div>
                <table class="table">
                    <thead>
                    <tr>
                        <th scope="col" colspan="2">Product</th>
                        <th scope="col" class="text-end">Quantity</th>
                        <th scope="col" class="text-end">USD</th>
                        <th scope="col" class="text-center">Type</th>
                        <th scope="col" class="text-center"></th>
                    </tr>
                    </thead>
                    <tbody>
                        ${line_items_html}
                    </tbody>
                </table>
            </div>` 
        });

        this.dashboard.querySelector('[data-delivery_schedule]').innerHTML = deliveryScheduleHTML;
  }


  }
customElements.define('custom-dashboard', dashboard);