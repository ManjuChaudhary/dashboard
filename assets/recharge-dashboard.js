var allSubscriptions=[]; // Stores All logged in customer subscriptions from recharge response including Active and In-Active Subscriptions
var activeSubscriptions=[]; // Stores Active Subscriptions
var inActiveSubscriptions=[]; // Stores In-Active Subscriptions
var giftSubscriptions=[]; // Stores Gift Subscriptions 
var productsJson={}; // Stored Store front all products JSON
var graphQLProductsJSON=null; // Stores GraphQL Products JSON which are used for displaying image
var customerAddresses=null; // Stored Recharge All Customer Addresses
var customerPaymentMethods=null; // Stores Customer Payment Methods
var subscriptionData={}; // Stores Specific Subscription Data when any modal is opened
var successModalType=null; // Used for confirmation modal open when any success full action is triggered
var selectedProduct = ""; // Used for storing shopify product information ( Ex. whenever product is changed in updating subscription  )
var selectedVariant = ""; // Used For storing shopify variant information ( Ex. whenever variant is changed in updating subscription   )
var selectedAddonVariant = ""; // Used For storing shopify variant information ( Ex. whenever variant is changed in updating subscription   )
var storeCancellationReason=[]; // Stored cancellation reason which are stored in recharge admin
var subscriptionId='';
var currentAddon =''; //Used when update addon is triggered
var subscriptionAddressId='';
var deliverySchedules=null; // Stores delivery schedule of the customer
var selectedAddons = []; //arrays of addons connected with selected subscription
var scheduleDeliveryFlag = false; //flag for scheduled delivery after any update is done.
var customerAddressId = null; // Stores address id to update
var addressIdForAddon = ''; // Stores address id, in order to pass while creating addon obj
var discounts=[];
var selectedProductOptions = [];
var allCharges=[];
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

await RechargeUtilities._getOnetimes();


}
//Get GraphQL Products JSON
await RechargeUtilities._getProductsJsonByGraphQl(); 
await this._createSubscriptionsHTML();
await this._createAddressHtml();
await this._createPayemntHTML();
await this._createDeliveryScheduleHTML();
// await this.ReactivateButton();
// Bind events in popup
await this._bindModalEvents();
// Remove class for Button Loading after any action is executed successfully
this.dashboard.querySelector('.btn.loading')?.classList.remove('loading');
if (successModalType != null) {
//Open Confirmation Modal after successfull api call 
this._showSuccessModal();
}
this._removeDisabledButton();

}

_createSubscriptionsHTML(){
allSubscriptions=window.customerDetails.rechargeSubscriptions;
graphQLProductsJSON= window.customerDetails.graphQLProductsJSON;
if (window.customerDetails.rechargeCustomerDetails) {
// Create Active Subscription HTML
this._createActiveSubscriptionsHTML();
// Create In-Active (Cancelled) Subscription HTML
this._createInActiveSubscriptionsHTML();
}else{
return data;
}
//Remove Dashboard Loader When All the Onload APIs Call Successful
this.dashboard.querySelector('[data-loader_button]').classList.add('d-none')
}
/**
 * Create Active Subscriptions HTML 
*/
_createActiveSubscriptionsHTML(){
activeSubscriptions=allSubscriptions.filter((subscription)=>{
if (subscription.status.toLowerCase() == 'active') {
    return subscription
}
})
this.dashboard.querySelector('[data-active-subscriptions]').innerHTML="";
if (activeSubscriptions.length > 0) {
this.dashboard.querySelector('[data-active-subscriptions]').classList.remove('d-none');
var activeHtml="";
activeSubscriptions.map((sub)=>{
    activeHtml=activeHtml+this._activeSubscriptionRowHTML(sub);
});
this.dashboard.querySelector('[data-active-subscriptions]').innerHTML=activeHtml;
}else{
this.dashboard.querySelector('[data-active-subscriptions]').classList.add('d-none');
}
}
/**
 * ROW Active Subscriptions HTML 
 * @param {JSON} subscription 
*/
_activeSubscriptionRowHTML(subscription){
var variant=graphQLProductsJSON[subscription.external_product_id.ecommerce].variants.filter((itm)=>{
if (itm.id == subscription.external_variant_id.ecommerce ) {
    return itm
}
})
variant=variant[0]

var style =this._activeHTML(subscription, variant);
return style;
}
_activeHTML(subscription, variant){
let addonHtml = this._addonHtml(subscription.id);
return `
<div class="recharge-active" data-single-active-subscription="${subscription.id}" data-subscription-id="${subscription.id}">
        <div class="border border-gray-100 pt-5 px-5 mt-5">
            <div class="row align-items-md-center mx-0">
                <div class="col-md-4 col-12 mb-md-0 mb-5 px-0">
                    <div class="d-flex align-items-center">
                    <div class="order-image pe-3">
                        <img src="${variant.image.src ? variant.image.src : graphQLProductsJSON[subscription.external_product_id.ecommerce].images[0].src}" alt="${subscription.product_title}" class="d-none d-lg-block recharge-img mw-100 me-3">
                    </div>
                    <div class="order-image-info pe-md-7">
                        <p class="font-size-md fw-normal ls-sm text-primary mb-2">#${subscription.id}</p>
                        <h6 class="font-family-base text-black fw-semibold ls-0 mb-0 text-capitalize" style="font-size: 17px;">${subscription.product_title}</h6>
                        <p>${subscription.quantity} x ${Shopify.formatMoney(variant.price * subscription.quantity * 100, window.globalVariables.money_format)}</p>
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
                    <a href="#" class="btn btn-primary" data-modal-opener="editsubscription-modal"><span class="add-text">edit</span><span class="spinner"></span></a>
                    <a href="#" data-modal-opener="one-time-product-popup" class="btn pe-1 rounded-0 py-2 px-0 mt-3">+ addon</a>
                </div>
        </div>
</div>`;
addonHtml
}

 /**
         * Create In-Active Subscriptions HTML 
        */
  _createInActiveSubscriptionsHTML(){
    inActiveSubscriptions=allSubscriptions.filter((subscription)=>{
        if (subscription.status.toLowerCase() == 'cancelled') {
            return subscription
        }
    })
    this.dashboard.querySelector('[data-inactive-subscriptions]').innerHTML="";
    if (inActiveSubscriptions.length > 0) {
        this.dashboard.querySelector('[data-inactive-subscriptions]').classList.remove('d-none');
        var inActiveHtml="";
        inActiveSubscriptions.map((sub)=>{
            inActiveHtml=inActiveHtml+this._inActiveSubscriptionRowHTML(sub);
        })
        this.dashboard.querySelector('[data-inactive-subscriptions]').innerHTML=inActiveHtml;
        this.dashboard.querySelectorAll('[data-reactive_subscription]').forEach(ele => {
            ele.addEventListener('click',(event)=>{
                event.preventDefault();
                let id=event.target.closest('[data-single-inactive-subscription]').getAttribute('data-single-inactive-subscription');
                event.target.closest('[data-reactive_subscription]')?.classList.add('loading');
                this._disableButton();
                this._reActivateSubscription(id)
            })
        });
    }else{
        this.dashboard.querySelector('[data-inactive-subscriptions]').classList.add('d-none')
    }
}
  /**
         * ROW In-Active Subscriptions HTML
         * @param {JSON} subscription  
        */
   _inActiveSubscriptionRowHTML(subscription){
    var variant=graphQLProductsJSON[subscription.external_product_id.ecommerce].variants.filter((itm)=>{
        if (itm.id == subscription.external_variant_id.ecommerce ) {
            return itm
        }
    })
    variant=variant[0]
    var style = this._inActiveHTML(subscription,variant);
    return style;
}
_inActiveHTML(subscription,variant){
    return `
    <div class="border recharge-inactive recharge-item" data-single-inactive-subscription="${subscription.id}">
    <div class="row align-items-md-center mx-0 recharge-item-wrapper">
        <div class="col-md-4 col-12 mb-md-0 mb-5 px-0">
            <div class="d-flex align-items-center">
                <div class="order-image pe-3">
                    <img src="${variant.image.src ? variant.image.src : graphQLProductsJSON[subscription.external_product_id.ecommerce].images[0].src}" alt="${subscription.product_title}" class="d-none d-lg-block recharge-img mw-100 me-3">
                </div>
                <div class="order-image-info pe-md-7">
                    <p class="font-size-md fw-normal ls-sm text-primary mb-2">#${subscription.id}</p>
                    <h6 class="font-family-base text-black fw-semibold ls-0 mb-0 text-capitalize" style="font-size: 17px;">${subscription.product_title}</h6>
                    <p>${subscription.quantity} x ${Shopify.formatMoney(variant.price * subscription.quantity * 100, window.globalVariables.money_format)}</p>
                </div>
            </div>
        </div>
            <div class="col-md-2 col-6 mb-md-0 mb-5 px-0">
                <p class="font-size-md fw-semibold text-black text-uppercase mb-2 d-block d-md-none">QTY</p>
                <p class="font-size-xl fw-normal text-black ls-0 mb-0 text-capitalize">In - Active</p>
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
                <a href="#" class="btn btn-primary mb-1" data-reactive_subscription><span class="add-text">reactivate</span><span class="spinner"></span></a>
            </div>
        </div>
    </div>
 </div>`;
}



/**
* Re-Activate Subscription
* 
* @param {Number} subscription_id
*/
async _reActivateSubscription(subscription_id){
var response=await RechargeUtilities._reActivateSubscription(subscription_id); 
if (response) {
this.onLoadData();
}
}

_createAddressHtml(){
customerAddresses = window.customerDetails.rechargeCustomerAddress;
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
let addressHTML = "";
for( var addresses of customerAddresses ){
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
this.dashboard.querySelector('[data-addresses_loader_button]').classList.add('d-none');
}




_createPayemntHTML(){
customerPaymentMethods = window.customerDetails.rechargePaymentMethods;
let allPaymentsHtml = "";
for( var payment of customerPaymentMethods )
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
this.dashboard.querySelector('[data-payment_loader_button]').classList.add('d-none');
}


_createDeliveryScheduleHTML(){
deliverySchedules = window.customerDetails.rechargeDeliverySchedule;
console.log(deliverySchedules);
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
this.dashboard.querySelector('[data-delivery_schedule_loader_button]').classList.add('d-none');
}

/**
 * Create AddOn HTML 
*/
_addonHtml(subscriptionId){
var connectedAddons = [];
window.customerDetails.rechargeOnetimes.map((addon)=>{
console.log(addon);
addon.properties.map((prop)=>{
    console.log(prop);
    if (prop.name == 'connected_subscription_id' && prop.value == subscriptionId) {
        connectedAddons.push(addon);
    }
});
});

let addonHtml='';
if(connectedAddons.length > 0){
addonHtml+='<div class="add-ons-products" data-addon-wrap=""><h5 class="fw-semibold mb-3">One-Time Add Ons</h5><div class="row m-n2">';
}

connectedAddons.map((addon)=>{
var addon_img_src = "";
if (graphQLProductsJSON[addon.external_product_id.ecommerce].images == null) {
    addon_img_src = window.globalVariables.settings.no_image_replacement;
} else {
    // get variant image
    var var_img = graphQLProductsJSON[addon.external_product_id.ecommerce].variants.filter((ele)=>{
        if(ele.id == addon.external_variant_id.ecommerce ){
            return ele;
        }
    });
    addon_img_src = var_img[0].image.src;
}

let varTitle = '';
if(addon.variant_title != null){
    varTitle = `<p class="mb-0"><span>${addon.variant_title}</span></p>`;
}
var tempAddonHtml = `
<div class="col-12 col-md-6 p-2" data-onetime-id="${addon.id}">
    <div class="border d-flex align-items-center position-relative add-ons-product-box">
        <a href="#" class="add-ons-product-close text-secondary btn p-0" data-addon-remove="${addon.id}">
            <span class="add-text"><i class="icon-close"></i></span><span class="spinner"></span></a>
        <img src="${addon_img_src}" alt="${addon.product_title}"> 
        <div class="ps-3 ps-lg-5">
            <p class="ls-sm text-uppercase mb-1 mb-lg-0 order-id">Qty: <span>${addon.quantity}</span></p>
            <p class="mb-1 mb-lg-2 fw-bold">${addon.product_title}</p>
            ${varTitle}
            <span>${Shopify.formatMoney(addon.price * addon.quantity * 100, window.globalVariables.money_format)}</span>
            <p>${addon.next_charge_scheduled_at}</p>
        </div>
        <a href="#" class="btn text-end text-right" data-modal-opener="editaddon-modal">
            <span class="add-text">edit</span><span class="spinner"></span></a>
    </div>
</div>
`;
addonHtml += tempAddonHtml;
})

if(connectedAddons.length > 0){
addonHtml+='</div></div>';
}

return addonHtml;
} 


/**
    * Create subscription product
    * @param {JSON} addonObj : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_create
    */
async _createSubscriptionProduct(subsDataObj){
var response=await RechargeUtilities._createSubscriptionProduct(subsDataObj); 
if (response) {
    this.onLoadData();
}
}

/**
    * Create a one-time addon
    * @param {JSON} addonObj : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_create
    */
async _createOnetimeAddon(addonObj){
var response=await RechargeUtilities._createOnetimeAddon(addonObj); 
if (response) {
    successModalType="planchangeconfirmed-modal";
    this.onLoadData();
}
}


/**
     * Bind Modal Events After Loading All The Subscriptions 
    */
_bindModalEvents(){
this.dashboard.querySelectorAll('[data-modal-opener]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.preventDefault();
        this.dashboard.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open')
        });
        let id=ele.getAttribute('data-modal-opener');
        // Action on Edit Shipping Address Modal
if (id == 'shippingaddress-modal') {
new Shopify.CountryProvinceSelector('shipping_country', 'shipping_province', {
    hideElement: 'shippingProvinceContainer'
});
if(ele.closest('[data-customer_address_id]')) {
    // from Address tab
    customerAddressId = ele.closest('[data-customer_address_id]').getAttribute('data-customer_address_id');
    this.dashboard.querySelector('#shippingaddress-modal [data-back_button]').classList.add('d-none');
    this._fillShippingAddress(customerAddressId);
} 
}
        document.querySelector(`#${id}`).show();
        this._showCurrentSubscription(event,id,ele);
    })
});
if(this.dashboard.querySelectorAll('[data-addon-remove]') != null){
this.dashboard.querySelectorAll('[data-addon-remove]').forEach(ele =>{
    var addon_id = ele.getAttribute('data-addon-remove');
    ele.addEventListener('click',(event)=>{
        event.preventDefault();
        event.target.closest('[data-addon-remove]')?.classList.add('loading');
        this._disableButton();
        var response =  RechargeUtilities._removeOnetimeAddon(addon_id);
        if (response) {
            this.onLoadData();
        }
    })
})
}
// To update variant for addon & edit subscription.
this.dashboard.querySelectorAll('[data-edit-card]').forEach(ele =>{
ele.querySelectorAll('[data-editProduct_variant]').forEach((option)=>{
    option.addEventListener('change',(event)=>{
        let productOptions=[];
        ele.querySelectorAll('[data-editProduct_variant]').forEach(ele => {
            productOptions.push(ele.value)
        })
        var addonProduct = JSON.parse(ele.closest('[data-edit-card]').querySelector('[data-editProduct_productjson]').innerText);
        var addonVariants = addonProduct.variants;
        selectedAddonVariant = this._updateVariant(addonVariants,productOptions)
        if(ele.closest('[data-edit-card]').querySelector('[data-editProduct_option]')) {
            ele.closest('[data-edit-card]').querySelector('[data-editProduct_option]').setAttribute('data-editProduct_option',selectedAddonVariant.id)
        }
        if(ele.closest('[data-edit-card]').querySelector('[data-currentprice]')){
            ele.closest('[data-edit-card]').querySelector('[data-currentprice]').innerHTML = Shopify.formatMoney(selectedAddonVariant.price, window.globalVariables.money_format);
        }
    })
})
})


this._bindOnLoadEvents()
}

/**
     * Bind useful events After Loading All The 
    */
_bindOnLoadEvents(){
// Bind Click Event on Change Addon edit Modal
this.dashboard.querySelectorAll('[data-update_addon_btn]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.stopImmediatePropagation();
        this._editAddon(event)
    })
});

//Bind event on subscription or onetime radio change to change price
this.dashboard.addEventListener('input',(e)=>{
    e.stopImmediatePropagation();
    if(e.target.getAttribute('name')=="addon_type"){
        if(e.target.value == 'onetime'){
            // hide frequency_selection
            this.dashboard.querySelector('[data-addon_frequency_selection]').classList.add('d-none');
            this._priceChange('onetime','editaddon-modal')
        }else{
            // show frequency_selection
            this.dashboard.querySelector('[data-addon_frequency_selection]').classList.remove('d-none');
            this._priceChange('subscription','addToMySubscription-modal')
        }
    }
})

document.querySelectorAll("#ModalClose-notifyme").forEach((element) =>{
    element.addEventListener('click',(event)=>{
        event.target.closest(".modal.open").classList.remove("open");
        document.querySelector("site-overlay").classList.remove("overlay--body");
        document.body.classList.remove("scroll-fixed");
        document.body.style.overflowY = "auto";
    });
})

// Bind Click Event on Change Addon edit Modal
this.dashboard.querySelectorAll('[data-add_addon_btn]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.stopImmediatePropagation();
        let qty=this.dashboard.querySelector('#addToMySubscription-modal [data-qty-container] [data-qty-input]').value;
        // check if one time or subscription
        var type = this.dashboard.querySelector('input[name="addon_type"]:checked').value;
        if(type == 'onetime') {
            event.target.closest('[data-add_addon_btn]')?.classList.add('loading');
            this._disableButton();
            successModalType="onetime-addon-success-modal";
            this._createaddonObj(qty);
            this._removeDisabledButton();
        } else {
            var frequency = this.dashboard.querySelector('[data-addon-subscription-frequency]').value;
            var intervalUnit = this.dashboard.querySelector('[data-addon-subscription-frequency-interval]').value;
            event.target.closest('[data-add_addon_btn]')?.classList.add('loading');
            this._disableButton();
            successModalType="subscription-created-success-modal";
            this._createSubscriptionObj(frequency, intervalUnit, qty);
            this._removeDisabledButton();
        }
    })
});
// Bind Click Event on Cancel Subscription Modal
this.dashboard.querySelectorAll('[data-cancel_subscriptions]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.stopImmediatePropagation();
        let reason=this.dashboard.querySelector('[data-select-cancel_reasons]')?.value;
        let feedback=this.dashboard.querySelector('[data-comment]')?.value;
        event.target.closest('[data-cancel_subscriptions]')?.classList.add('loading');
        successModalType="cancelled-modal";
        this._cancelSubscription(subscriptionData.id,reason,feedback)
    })
});

    // Bind click event on cancel trigger button 
    this.dashboard.querySelectorAll('[data-cancel_trigger]').forEach(ele => {
    ele.addEventListener('click',(event)=> {
        console.log("cancled_click");
        // Function to decide which modal to show (cancel/apply discount before cancel)
        this._checkIfFirstTimeCancelled()
    })
});
// Bind click event when clicked on apply discount before cancel
this.dashboard.querySelector('[data-apply_discount_before_cancel]')?.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    event.target.closest('[data-apply_discount_before_cancel]')?.classList.add('loading');
    this._disableButton();
    successModalType="cancelsub-discountConfirmed-modal";
    this._applyDiscountBeforeCancel();
});

// Bind Click Event on Skipping Charge Date
this.dashboard.querySelectorAll('[name="skip_next_shipment"]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.stopImmediatePropagation();
        if (ele.checked) {
            if (ele.value == 'skip-subscription') {
                this.dashboard.querySelector('[data-current_charge_date]').innerText=moment(subscriptionData.next_charge_scheduled_at).format('MMMM DD, YYYY');
                let new_next_charge_date=moment(subscriptionData.next_charge_scheduled_at, "YYYY-MM-DD").add(subscriptionData.order_interval_frequency, subscriptionData.order_interval_unit)
                this.dashboard.querySelector('[data-new_next_chargeDate]').innerText=moment(new_next_charge_date).format('MMMM DD, YYYY');
                ele.closest('[data-updated-next-charge-date]').setAttribute('data-updated-next-charge-date',moment(new_next_charge_date).format('YYYY-MM-DD'));
            }
            if (ele.value == 'pause-subscription') {
                this.dashboard.querySelector('[data-charge_datepicker]').value=moment(subscriptionData.next_charge_scheduled_at).format('YYYY-MM-DD');
                this.dashboard.querySelector('[data-new_datepicker_next_chargeDate]').innerHTML=moment(subscriptionData.next_charge_scheduled_at).format('MMMM DD, YYYY');
                this.dashboard.querySelector('[data-charge_datepicker]')?.addEventListener('change',(event)=>{
                    event.stopImmediatePropagation();
                    ele.closest('[data-updated-next-charge-date]').setAttribute('data-updated-next-charge-date',moment(event.target.value).format('YYYY-MM-DD'));
                    this.dashboard.querySelector('[data-new_datepicker_next_chargeDate]').innerHTML=moment(event.target.value).format('MMMM DD, YYYY');
                })
            }
        }
    })
});
// Bind Click Event on Updating Charge Date Button
this.dashboard.querySelectorAll('[data-update_charge_date]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.stopImmediatePropagation();
        this._updateChargeDate(event);
    })
});

// Bind Click Event on Changing Frequency Modal
this.dashboard.querySelectorAll('[data-update-subscription_frq]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.stopImmediatePropagation();
        this._updateSubscriptionFrq(event);
    })
});

// Bind Click Event on Change Subscription Modal
this.dashboard.querySelectorAll('[data-update_subscription_btn]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.stopImmediatePropagation();
        this._swapSubscription(event)
    })
});

// Bind Click event for addon products & edit subscription
this.dashboard.querySelectorAll('[data-editProduct_option]').forEach(ele=>{
    ele.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
        event.target.closest('[data-editProduct_option]')?.classList.add('loading');
        this._disableButton();
        if(ele.hasAttribute('data-edit-product')){
            selectedProduct = ele.getAttribute('data-edit-product');
            selectedVariant = ele.getAttribute('data-editProduct_option');
            this._swapSubscriptionProduct();
        }
    });
});

    // Bind Click Event on Update Shipping Address Button
    this.dashboard.querySelectorAll('[data-update_shipping_address]').forEach(ele => {
    ele.addEventListener('click',(event)=>{
        event.stopImmediatePropagation();
        event.target.closest('[data-update_shipping_address]')?.classList.add('loading');
        successModalType="shippingaddressConfirmed-modal";
        this._updateShippingAddress();
    })
});

  // Bind Click Event on Send em email Notification
  this.dashboard.querySelector('[data-send_email]').addEventListener('click',(event)=>{
    // event.stopImmediatePropagation();
    event.target.closest('[data-send_email]')?.classList.add('loading');
    this._disableButton();
    successModalType="UpdatePaymentconfirmed-modal";
    this._updatePaymethodMethod();
    this._removeDisabledButton();
})

}

/**
     * 
     * @param {String} eventType : Performing specified action on specified event type modal
     * @param {element} element 
     */
async _showCurrentSubscription(event,eventType,element){
if(element.closest('[data-onetime-id]')){ // Set data when edit onetime
    currentAddon = element.closest('[data-onetime-id]').getAttribute('data-onetime-id'); 
    let subscriptions = window.customerDetails.rechargeOnetimes.filter((addon)=>{
        if(addon.id == currentAddon){
            return graphQLProductsJSON[addon.external_product_id.ecommerce]
        }
    });
    if (subscriptions.length > 0) {
        subscriptionData = subscriptions[0];
    }
}else if (element.closest('[data-subscription-id]')) {
    // Stores the current subscription data when any modal is opened
    let subscriptionId=parseInt(element.closest('[data-subscription-id]')?.getAttribute('data-subscription-id'));
    let subscriptions=activeSubscriptions.filter((subscription)=>{
        if (subscriptionId == subscription.id) {
                return subscription
        }
    }) 
    if (subscriptions.length > 0) {
        subscriptionData=subscriptions[0];
    }  
}
// Actions on Skipping Modal
if (eventType == 'skipnextshipment-modal') {
    if (this.dashboard.querySelector('#order-skip-next') != null) {
        this.dashboard.querySelector('#order-skip-next').click();
    }
    if(event.target.closest('[data-default_open]').getAttribute('data-default_open') == 'pause'){
        if (this.dashboard.querySelector('#order-pause-subscription') != null) {
            this.dashboard.querySelector('#order-pause-subscription').click();
        }
    }
}

if(subscriptionData.id != undefined){
    var handle=graphQLProductsJSON[subscriptionData.external_product_id?.ecommerce].handle;
    // Get Shopify Product JSON of Current Subscription Product
    if (productsJson[subscriptionData.external_product_id?.ecommerce]) {
        selectedProduct=productsJson[subscriptionData.external_product_id?.ecommerce]
    }else{
        //Display loader in popup before HTML structure is created
        this.dashboard.querySelectorAll('[data-loader_popup]').forEach((loader)=>{
            loader.classList.remove('d-none');
        });
        selectedProduct=await RechargeUtilities._getStoreFrontProductJSON(handle);
        productsJson[selectedProduct.id]=selectedProduct;
    }

    selectedAddons=[];
    // Create addon array connected with subscription
    window.customerDetails.rechargeOnetimes.map((addon)=>{
        addon.properties.map((prop)=>{
            if (prop.name == 'connected_subscription_id' && prop.value == subscriptionData.id) {
                selectedAddons.push(addon);
            }
        });
    });
}
// Actions on update subscription modal
if (eventType == 'changesubscription-modal' || eventType == 'editaddon-modal' ) {
    if (subscriptionData) {
        this._generateProductHtml(eventType);
    }
}

//for addon or subscription
if(eventType == 'addToMySubscription-modal'){
    selectedProduct = JSON.parse(element.closest('[data-edit-card]').querySelector('[data-editProduct_productjson]').innerText);
    selectedProductOptions = JSON.parse(element.closest('[data-edit-card]').querySelector('[data-editProduct_productOptionjson]').innerText);
    this._generateProductHtml(eventType);
}
// Fetch Cancellation Reasons from Recharge admin side for cancellation modal 
if (storeCancellationReason.length == 0) {
    this._fetchCancellationReason();
}
    // Highlight Frequency Of Current Subscription
    if (eventType === 'deliveryfrequency-modal') {
    this._createDeliveryFrequencyHTML()
    this.dashboard.querySelectorAll('[data-subscription-frq]').forEach(ele => {
        if (ele.querySelector('[data-subscription-frq-unit]') != null) {
            ele.querySelector('[data-subscription-frq-unit]').innerText=subscriptionData?.order_interval_unit;
        }
    });
    this.dashboard.querySelector(`[data-subscription-frq="${subscriptionData.order_interval_frequency}"] label`)?.click();
}
    // Actions on update subscription modal
    if (eventType == 'changesubscription-modal' ) {
    if (subscriptionData) {
        this._generateProductHtml(eventType);
    }
    }

}  

_fillShippingAddress(address_id){
customerAddresses = window.customerDetails.rechargeCustomerAddress;
// Convert Customer Addresses array to object for avoiding looping
let rechargeaddress = {};
customerAddresses.map((address, i) => {
rechargeaddress[address.id] = address;
});
customerAddresses = rechargeaddress;
const regionNames = new Intl.DisplayNames(
    ['en'], {type: 'region'}
);
this.dashboard.querySelectorAll('[data-shipping_address]').forEach(ele => {
    if (ele.getAttribute('data-shipping_address') != 'country_code') {
        ele.value=customerAddresses[address_id][ele.getAttribute('data-shipping_address')];
    }
    if (ele.getAttribute('data-shipping_address') == 'country_code') {
        ele.value=regionNames.of(customerAddresses[address_id][ele.getAttribute('data-shipping_address')])
    }
});
}


_createDeliveryFrequencyHTML(){
let html=``;
for (const selling_plan of selectedProduct.selling_plan_groups[0].selling_plans) {
    let frq="";
    if (selling_plan.options[0].value.toLowerCase().includes(' ')) {
        frq=selling_plan.options[0].value.split(' ')[0];
    }
    let tempHTML=`
    <div class="col-12 col-md-6 p-2" data-subscription-frq="${frq}">
        <div class="frequency-box h-100">
            <input type="radio" id="frequency-${frq}" name="frequency" value="${frq}" class="d-none">
            <label class="mb-0 d-flex align-items-center justify-content-center" for="frequency-${frq}">
                <div class="checkmark-icon d-flex">
                    <svg width="17" height="17" viewBox="0 0 17 17">
                        <path id="Icon_ionic-ios-checkmark-circle" data-name="Icon ionic-ios-checkmark-circle" d="M11.875,3.375a8.5,8.5,0,1,0,8.5,8.5A8.5,8.5,0,0,0,11.875,3.375Zm4.352,6.15-5.464,5.488h0a.738.738,0,0,1-.474.225.715.715,0,0,1-.478-.233L7.519,12.717a.163.163,0,0,1,0-.233l.727-.727a.158.158,0,0,1,.229,0l1.814,1.814,4.986-5.022a.161.161,0,0,1,.114-.049h0a.148.148,0,0,1,.114.049l.715.74A.161.161,0,0,1,16.227,9.525Z" transform="translate(-3.375 -3.375)" fill="#f36a10"/>
                    </svg>
                </div>
                <p class="mb-0 font-size-md fw-medium text-center text-capitalize"> every ${frq} <span data-subscription-frq-unit></span></p>
            </label>
        </div>
    </div>
    `;
    html+=tempHTML;
}
this.dashboard.querySelector('[data-subscription_frequencies]').innerHTML=html;
}

/**
     *  Generate current subscription shopify products options and price and Qty modal 
    */
_generateProductHtml(eventType){
    var optionsList = [];
    if(eventType == 'addToMySubscription-modal'){
        selectedVariant=selectedProduct.variants;
        optionsList = selectedProductOptions;
    }else{
        selectedVariant=selectedProduct.variants.filter((itm)=>{
            if (itm.id == subscriptionData.external_variant_id.ecommerce ) {
                return itm
            }
        });
        optionsList = selectedProduct.options;
    }
    selectedVariant=selectedVariant[0];
    selectedAddonVariant = selectedVariant.id;
    this.dashboard.querySelector('[data-qty-container] [data-qty-input]').value=subscriptionData.quantity;
    // Update selectedVariant object and variant's price and image on changing options
    this._updateDataOnVariantChange(eventType);
    // Generate available options HTML for changing option
    var allProductOptions = "";
    for (const [i, option] of optionsList.entries()) {
        let optionHtml = ``;
        let title = selectedVariant.title.split('/')
        for (const value of option.values) { 
            //to keep option selected
            let selectedClass = '';
            title.filter((t)=>{ 
                if(t.trim()==value.trim()){
                    selectedClass = 'selected';
                }
            });
            let temp = `<option value="${value}" ${selectedClass}>${value}</option>`;
            optionHtml += temp;
        }
        let tempHtml = `
            <div class="col-md-4 col-6  pe-2 ${option.name.toLowerCase() == 'title' ? 'd-none' : ''}">
                <h6 class="text-uppercase font-size-xs ls-sm" >${option.name}:</h6>
                <select name="pdp-${option.name}" id="pdp-${option.name}" data-product_option>
                    ${optionHtml}
                </select>
            </div>
        `;
        allProductOptions += tempHtml;
    }
    // for edit addon html
    if(eventType =='editaddon-modal' || eventType == 'addToMySubscription-modal'){
        this.dashboard.querySelector(`#${eventType} [data-addon-update] [data-subscription_options]`).innerHTML = allProductOptions;
    }else{
        this.dashboard.querySelector('[data-subscription-update] [data-subscription_options]').innerHTML = allProductOptions;
    }
    //Bind Increment / Decrement Qty wrapper events 
    this.dashboard.querySelectorAll('[data-qty-btn]').forEach(ele => {
        ele.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            let action = ele.getAttribute('data-qty-btn');
            this._qtyUpdate(event, action);
            this._updateDataOnVariantChange(eventType);
        })
    }); 
    // Set variant on option changing
    this.dashboard.querySelectorAll('[data-product_option]').forEach(ele => {
        ele.addEventListener('change',(event)=>{
            event.stopImmediatePropagation();
            let productOptions=[];
            this.dashboard.querySelectorAll('[data-product_option]').forEach(ele => {
                productOptions.push(ele.value)
            })
            let variantsArray = selectedProduct.variants
            selectedVariant = this._updateVariant(variantsArray,productOptions)
            selectedAddonVariant = selectedVariant.id;
            this._updateDataOnVariantChange(eventType);
        })
    });
    // this.dashboard.querySelector('[data-addon-update]').classList.remove('d-none');
    this.dashboard.querySelectorAll('[data-loader_popup]').forEach((loader)=>{
        loader.classList.add('d-none');
    });
}

/**
     * Update variant image and price on variant changed
    */
_updateDataOnVariantChange(eventType){
let imgSrc=null;
if(selectedVariant.featured_image){
    imgSrc=selectedVariant.featured_image.src;
}else if(selectedProduct.featured_image){
    imgSrc=selectedProduct.featured_image
}else{
    imgSrc=window.customerDetails.no_image_replacement;
}
var productType = 'subscription'
if (eventType == 'editaddon-modal') {
    productType == 'onetime'
}else if(eventType == 'addToMySubscription-modal'){
    productType = this.dashboard.querySelector('input[name="addon_type"]:checked')?.value || 'onetime'
}
if(productType == 'onetime'){
    this.dashboard.querySelector(`#${eventType} [data-addon-update] [data-update_subscription] [data-update_subscription_img]`).setAttribute('src',imgSrc);
}else{
    this.dashboard.querySelector(`#${eventType} [data-update_subscription_img]`).setAttribute('src',imgSrc);
}
this._priceChange(productType,eventType)
}
_priceChange(productType,eventType){
let discountedPrice=selectedVariant.price;
//for edit addon with subscription change here
if(productType == 'subscription' && selectedVariant.selling_plan_allocations[0]){
    discountedPrice=selectedVariant.selling_plan_allocations[0].price;
}
if(eventType =='editaddon-modal' || eventType == 'addToMySubscription-modal'){
    var qty=this.dashboard.querySelector(`#${eventType} [data-addon-update] [data-qty-container] [data-qty-input]`).value;
}else{
    var qty=this.dashboard.querySelector('[data-subscription-update] [data-qty-container] [data-qty-input]').value;
}
let price=`${Shopify.formatMoney(discountedPrice * qty, window.globalVariables.money_format)}`;
if(eventType =='editaddon-modal' || eventType == 'addToMySubscription-modal'){
    this.dashboard.querySelector(`#${eventType} [data-addon-update] [data-subscription_price]`).innerHTML=price;
}else{
    this.dashboard.querySelector('[data-subscription-update] [data-subscription_price]').innerHTML=price;
}
}

/**
     * 
     * @param {event} event 
     * @param {String} action : value must be Plus / Minus 
     */
_qtyUpdate(event,action){
let qty = parseInt(event.target.closest('[data-qty-container]').querySelector('input').value);
if (action == 'plus') {
    event.target.closest('[data-qty-container]').querySelector('input').value = qty + 1;
} else {
    if (qty > 1) {
        event.target.closest('[data-qty-container]').querySelector('input').value = qty - 1;
    }
}
}

/**
     * Create addon object
    */
_createaddonObj(qty){
var addonObj={
    address_id: subscriptionData.address_id,
    next_charge_scheduled_at: subscriptionData.next_charge_scheduled_at,
    use_shopify_variant_defaults: true,
    external_variant_id:{
        ecommerce: `${selectedAddonVariant}`
    },
    quantity: qty,
    properties: [
        {
            name: "connected_subscription_id",
            value: `${subscriptionData.id}`
        }
    ]
}
this._createOnetimeAddon(addonObj);
}

/**
     * Function to create subscription data object 
    */
_createSubscriptionObj(frequency, intervalUnit, qty){
var subsDataObj = {
    "address_id": subscriptionData.address_id,
    "next_charge_scheduled_at": subscriptionData.next_charge_scheduled_at,
    "charge_interval_frequency": frequency,
    "order_interval_frequency": frequency,
    "order_interval_unit": intervalUnit,
    "external_variant_id":{
        'ecommerce': `${(selectedVariant.id).toString()}`
    },
    "quantity": qty
}
this._createSubscriptionProduct(subsDataObj);
}



/**
     * Edit Addon function
    */
async _editAddon(event){
let qty=this.dashboard.querySelector('[data-addon-update] [data-qty-container] [data-qty-input]').value;
var addonObj={
    'external_variant_id': {
        'ecommerce': `${(selectedVariant.id).toString()}`
    },
    'quantity': qty
}
event.target.closest('[data-update_addon_btn]')?.classList.add('loading');
this._disableButton();
successModalType="addonchangeconfirmed-modal";
await this._updateOnetimeAddon(currentAddon,addonObj);
}
/**
* Update one-time Addon product
* 
* @param {Number} addon_Id
* @param {JSON} addonObj : https://developer.rechargepayments.com/2021-11/onetimes/onetimes_update
*/
async _updateOnetimeAddon(addon_Id,addonObj){
var response=await RechargeUtilities._updateOnetimeAddon(addon_Id,addonObj); 
if (response) {
    this.onLoadData();
}
}
/**
 * Update variant on option changed
*/
_updateVariant(variantsArray,productOptions){
let updatedVariant = variantsArray[0];    
variantsArray.find((variant) => {
    // get true or false based on options value presented in variant
    // value format would be [true/false,true/false,true/false] boolean value based on options present or not
    let variant_options=[];
    for (let i = 1; i <= 3; i++) {
        if (variant[`option${i}`] != null) {
            variant_options.push(variant[`option${i}`]);
        }
    }
    let mappedValues = variant_options.map((option, index) => {
        return productOptions[index] === option;
    });
    // assign variant details to this.currentVariant if all options are present
    if(!mappedValues.includes(false)){
        updatedVariant = variant;
    }
});
return updatedVariant
}

/**
     * Fetch Cancellation Reason and Render Reasons in Cancellation Modal
     */
async _fetchCancellationReason(){
storeCancellationReason= await RechargeUtilities._listRetentionStrategies();
let cancelHTML="";
for (const [i,cancelReason] of storeCancellationReason.entries()) {
    let reasonHTML=`
    ${i == 0 ? `<option value=null>Select a Reason</option>` : `<option value="${cancelReason.id}">${cancelReason.reason}</option>`}`;
    cancelHTML+=reasonHTML;
}
this.dashboard.querySelector('[data-select-cancel_reasons]').innerHTML=cancelHTML;
// disable button
this.dashboard.querySelector('[data-cancel_subscriptions]').classList.add('disabled');
this.dashboard.querySelector('[data-select-cancel_reasons]').addEventListener('change',(event)=>{
    if (event.target.closest('[data-select-cancel_reasons]').value == 'null') {
        event.target.closest('[data-select-cancel_reasons]').classList.add('border-danger');
        this.dashboard.querySelector('[data-cancel_subscriptions]').classList.add('disabled');
    }else{
        event.target.closest('[data-select-cancel_reasons]').classList.remove('border-danger');
        this.dashboard.querySelector('[data-cancel_subscriptions]').classList.remove('disabled');
    }
})
}

/**
     * Cancel Subscription and delete addons
     * 
     * @param {Number} subscription_id
     * @param {String} reason
     * @param {String} feedback
     */
async _cancelSubscription(subscriptionId,reason,feedback){
// If Addons are connected with subscription first delete them
if (selectedAddons.length > 0){
    var response = await RechargeUtilities._cancelOnetimeAddon(selectedAddons);
    if (response) {
        // Once Addons are deleted cacel the subscription
        var response2=await RechargeUtilities._cancelSubscription(subscriptionId,reason,feedback); 
        if(response2){this.onLoadData();}
    }
}else{
    // If addons are not there directly cancel sunscription
    var response=await RechargeUtilities._cancelSubscription(subscriptionId,reason,feedback); 
    if(response){this.onLoadData();}
}
}

/**
     * Swap Subscription Function and prepare object for Updating subscription
     */
async _swapSubscription(event){
let qty=this.dashboard.querySelector('[data-subscription-update] [data-qty-container] [data-qty-input]').value;
var updateSubscriptionObj={
    'use_shopify_variant_defaults': true,
    'external_variant_id': {
        'ecommerce': `${(selectedVariant.id).toString()}`
    },
    'quantity': qty
}
event.target.closest('[data-update_subscription_btn]')?.classList.add('loading');
this._disableButton();
successModalType="planchangeconfirmed-modal";
await this._updateSubscription(subscriptionData.id,updateSubscriptionObj);
}

/**
 * Update Shipping Address
*/
async _updateShippingAddress(event){
let shippingAddressObj={};
this.dashboard.querySelectorAll('[data-shipping_address]').forEach(ele => {
    if (ele.getAttribute('data-shipping_address') != 'country_code') {
        shippingAddressObj[ele.getAttribute('data-shipping_address')]=ele.value;
    }
});
successModalType="shippingaddressConfirmed-modal";
await this._changeShippingAddress(subscriptionData.address_id || customerAddressId ,shippingAddressObj);

}

/**
* Change Shipping Address
* 
* @param {Number} address_id
* @param {JSON} updatedAddressObj : https://developer.rechargepayments.com/2021-11/addresses/update_address
*/
async _changeShippingAddress(address_id,updatedAddressObj){
console.log("updatedAddressObj",updatedAddressObj);
    var response=await RechargeUtilities._changeShippingAddress(address_id,updatedAddressObj); 
    if (response) {
        this.onLoadData();
    }else{
        // Remove class for Button Loading after any action has been failed.
        this.dashboard.querySelector('.btn.loading')?.classList.remove('loading')
    }
}

/**
 * Swap Subscription Function with exchange of product and prepare object for Updating subscription
*/
async _swapSubscriptionProduct(){
var updateSubscriptionObj={
    'use_shopify_variant_defaults': true,
    'external_variant_id': {
        'ecommerce': `${selectedVariant.toString()}`
    },
    "external_product_id": {
        "ecommerce": `${selectedProduct.toString()}`
    }
}
successModalType="planchangeconfirmed-modal";
await this._updateSubscription(subscriptionData.id,updateSubscriptionObj);
}
/**
    * Update Subscription
    * 
    * @param {Number} subscription_id
    * @param {JSON} updateSubscriptionObj : https://developer.rechargepayments.com/2021-11/subscriptions/subscriptions_update    
    */
async _updateSubscription(subscription_id,updateSubscriptionObj){
var response=await RechargeUtilities._updateSubscription(subscription_id,updateSubscriptionObj); 
if (response) {
    this.onLoadData();
}
}
/**
     * Update Subscription Frequency
    */
async _updateSubscriptionFrq(event){
let frq=event.target.closest('#deliveryfrequency-modal').querySelector('input:checked').value;
let frq_unit=subscriptionData.order_interval_unit;
var updateSubscriptionObj={
    charge_interval_frequency : frq,
    order_interval_frequency: frq,
    order_interval_unit: frq_unit
}
event.target.closest('[data-update-subscription_frq]')?.classList.add('loading');
this._disableButton();
successModalType="frequencyconfirmed-modal";
await this._updateSubscription(subscriptionData.id,updateSubscriptionObj);
}

/**
     * Function to decide which modal to show (cancel/apply discount before cancel)
     */
    _checkIfFirstTimeCancelled() {
    // Logic to show modal of cancel or discount
    var discountShowStatus = this.dashboard.querySelector('[data-cancel_trigger]').getAttribute('data-show_discount');
    console.log(discountShowStatus);
    if(discountShowStatus == 'true') {
        var cancellation_status = subscriptionData.properties.find( item => item.name === "is_cancel_firsttime") || null ;
        console.log(cancellation_status);
        // check if it has properties (which means that its not first time)  
        if(cancellation_status == null) {
            // this means that its first time - show apply discount modal
            this.dashboard.querySelectorAll('.modal.open').forEach(modal => {
                modal.classList.remove('open')
            });
            this.dashboard.querySelector(`#cancelsub-discount-modal`).show();
        } else {
            // this means that its not first time, show cancel modal
            this._showCancelModal();
        }
    } else {
        // this means that its not first time - show cancel modal
        this._showCancelModal();
    }
}

/**
         * Function to apply discount before cancellation  
     */
    async _applyDiscountBeforeCancel() {
    // Get discount value from theme settings
    var discountpercent = this.dashboard.querySelector('[data-apply_discount_before_cancel]').getAttribute('data-discount_amount');
    // Update the price with applying discount
    var subscriptionPrice = subscriptionData.price;
    var updatedPrice = (subscriptionPrice - ((discountpercent * subscriptionPrice)/100)).toFixed(2);
    var subscriptionProperties = subscriptionData.properties;
    // Append new value to properties array
    subscriptionProperties.push({name: 'is_cancel_firsttime',value: 'false'})
    var updatedSubscriptionObj = {
        "price": updatedPrice,
        properties: subscriptionProperties
    }
    await this._updateSubscription(subscriptionData.id,updatedSubscriptionObj);
}

/**
    * Update next charge date for subscription and Addons
    * 
    * @param {Number} subscription_id
    * @param {Date} nextChargeDate ( YYYY-MM-DD )
    */
    async _setNextChargeDate(subscription_id, nextChargeDate) {
    var response=await RechargeUtilities._changeChargeDate(subscription_id,nextChargeDate); 
    if (response) {
        // If Addons are connected with subscription change their dates also
        if (selectedAddons.length > 0){
                var response2 = await RechargeUtilities._changeChargeDateAddon(selectedAddons,nextChargeDate)
                if(response2){this.onLoadData();}
        }else{
            this.onLoadData();
        }
    }
}

/**
     * Update Next Charge Date 
    */
    async _updateChargeDate(event){
    event.target.closest('[data-update_charge_date]')?.classList.add('loading');
    this._disableButton();
    successModalType="skipconfirmed-modal";
    let newChargeDate=event.target.closest('[data-updated-next-charge-date]').getAttribute('data-updated-next-charge-date')
    await this._setNextChargeDate(subscriptionData.id,newChargeDate);
    this.dashboard.querySelector('[data-successChargeDate]').innerText=moment(newChargeDate).format('MMMM DD, YYYY');
}

 /**
    * Send an email notification
    * 
    */
  async _updatePaymethodMethod(){
    var response=await RechargeUtilities._updatePaymethodMethod(); 
    if (response) {
        // Remove class for Button Loading after any action is executed successfully
        this.dashboard.querySelector('.btn.loading')?.classList.remove('loading');
        if (successModalType != null) {
            //Open Confirmation Modal after successfull api call 
            this._showSuccessModal();
        }
    }
}

/**
 * Function to show cancel modal
 */
_showCancelModal(){
this.dashboard.querySelectorAll('.modal.open').forEach(modal => {
    modal.classList.remove('open')
});
this.dashboard.querySelector(`#cancelsub-modal`).show();
}

_showSuccessModal(){
this.dashboard.querySelectorAll('.modal.open').forEach(modal => {
    modal.classList.remove('open')
});
this.dashboard.querySelector(`#${successModalType}`).show();
successModalType=null;
}
/**
 * Disable each button once any api is called
*/
_disableButton(){
this.dashboard.querySelectorAll('.btn').forEach(ele => {
    ele.classList.add('disabled')
});
}

/**
     * Enable each button once any api call is completed
    */
_removeDisabledButton(){
this.dashboard.querySelectorAll('.btn').forEach(ele => {
    ele.classList.remove('disabled')
});
}

/// ADD ONS WITH POPUP



}
customElements.define('custom-dashboard', dashboard);