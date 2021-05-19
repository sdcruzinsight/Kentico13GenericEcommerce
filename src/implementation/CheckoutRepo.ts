﻿"use strict"

import { Address } from "./Address";
import { Customer } from "./Customer";
import { EcommerceClassRepo } from "./EcommerceClassRepo";
import { ListItem } from "./ListItem";

export class CheckoutRepo {
    paymentEvent: Event

    createOrderEvent: Event 

    updateOrderEvent: Event

    getCountriesEvent: Event

    orderGUID: string

    getAddressesEvent: Event

    customerCreated: boolean

    constructor() {
        this.paymentEvent = new Event("payment");
        this.orderGUID = "";
        this.createOrderEvent = new Event("create-order");
        this.updateOrderEvent = new Event("update-order");
        this.getCountriesEvent = new Event("get-countries");
        this.customerCreated = document.body.querySelector(".customer[data-customerexists]") != null;
        this.getAddressesEvent = new Event("get-addresses");
    }

    redeemCouponEvent(coupon: string): CustomEvent<string> {
        return new CustomEvent("redeem-coupon", { detail: coupon });
    }

    removeCouponEvent(coupon: string): CustomEvent<string> {
        return new CustomEvent("remove-coupon", { detail: coupon });
    }

    getStatesEvent(selectId: string, countryId: Number): CustomEvent<{ [key: string]: any}> {
        return new CustomEvent("get-states", { detail: { "selectId": selectId, "countryId": countryId } });
    }

    getAddressEvent(addressID: Number, addressType: Number): CustomEvent<{[key: string]: Number}> {
        return new CustomEvent("get-address", {
            detail: {
                "addressID": addressID,
                "addressType": addressType
            }
        });
    }

    paymentResultEvent(result: object): CustomEvent<object> {
        return new CustomEvent("payment-result", { detail: result });
    }

    setCustomerEvent(result: Customer): CustomEvent<Customer> {
        return new CustomEvent("set-customer", { detail: result });
    }


    setBillingAddressEvent(result: Address): CustomEvent<Address> {
        return new CustomEvent("set-billing-address", { detail: result });
    }


    setShippingAddressEvent(result: Address): CustomEvent<Address> {
        return new CustomEvent("set-shipping-address", { detail: result });
    }


    setShippingOptionEvent(result: number): CustomEvent<number> {
        return new CustomEvent("set-shipping-option", { detail: result });
    }


    setPaymentOptionEvent(result: number): CustomEvent<number> {
        return new CustomEvent("set-payment-option", { detail: result });
    }

    async getOrder(): Promise<string> {
        return EcommerceClassRepo.ajax("/Checkout/GetOrder").then((response) => {
            return response.text();
        }).then((html) => {
            return html;
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
            return null as any;
        });
    }

    async getShippingOptions(selectId: string): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/GetShippingOptions").then((response) => {
            return response.json();
        }).then((options) => {
            EcommerceClassRepo.applyDropdownList(selectId, options);
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async getPaymentOptions(): Promise<ListItem[]> {
        return EcommerceClassRepo.ajax("/Checkout/GetPaymentOptions")
            .then((response) => {
                return response.json();
            })
            .then((options) => {
                return options as ListItem[];
            }).catch((error) => {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
                return null as any;
            });
    }

    async getCountries(selectId: string): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/GetCountries")
            .then((response) => {
                return response.json();
            })
            .then((options) => {
                EcommerceClassRepo.applyDropdownList(selectId, options);
            })
            .catch((error) => {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
            });
    }

    async getStates(selectId: string, countryId: Number): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/GetStates", {
            method: "POST",
            body: EcommerceClassRepo.getJSON(countryId),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((options) => {
            EcommerceClassRepo.applyDropdownList(selectId, options);
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async getPaymentForm(): Promise<string> {
        return EcommerceClassRepo.ajax("/Payment/GetPaymentForm").then((response) => {
            return response.text();
        }).then((html) => {
            return html;
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
            return null as any;
        });
    }

    async createOrder(): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/CreatOrder", {
            method: "POST",
            body: EcommerceClassRepo.getJSON({}),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((order) => {
            if (!order.orderFailed) {
                this.orderGUID = order.orderGUID;
                document.body.dispatchEvent(this.paymentEvent);
            } else {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(order.message));
            }
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async setCustomer(customer: Customer): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/SetCustomer", {
            method: "POST",
            body: EcommerceClassRepo.getJSON(customer),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.message) {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(json.message));
            }
            this.customerCreated = true;
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
            this.customerCreated = false;
        });
    }

    async setBillingAddress(address: Address): Promise<void> {
        if (!this.customerCreated) {
            setTimeout(() => { this.setBillingAddress(address) }, 500);
            return;
        }
        return EcommerceClassRepo.ajax("/Checkout/SetBillingAddress", {
            method: "POST",
            body: EcommerceClassRepo.getJSON(address),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.message) {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(json.message));
            }
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async setShippingAddress(address: Address): Promise<void> {
        if (!this.customerCreated) {
            setTimeout(() => { this.setShippingAddress(address) }, 500);
            return;
        }
        return EcommerceClassRepo.ajax("/Checkout/SetShippingAddress", {
            method: "POST",
            body: EcommerceClassRepo.getJSON(address),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.message) {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(json.message));
            }
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async setShippingOption(id: number): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/SetShippingOption", {
            method: "POST",
            body: EcommerceClassRepo.getJSON({ "optionID": id }),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.message) {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(json.message));
            }
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async setPaymentOption(id: number): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/SetPaymentOption", {
            method: "POST",
            body: EcommerceClassRepo.getJSON({ "optionID": id }),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.message) {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(json.message));
            }
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async redeemCoupon(coupon: string): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/AddCoupon", {
            method: "POST",
            body: EcommerceClassRepo.getJSON(coupon),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.message) {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(json.message));
            }
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async removeCoupon(coupon: string): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/RemoveCoupon", {
            method: "POST",
            body: EcommerceClassRepo.getJSON(coupon),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.message) {
                document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(json.message));
            }
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async getAddresses(shippingID: string, billingID: string): Promise<void> {
        return EcommerceClassRepo.ajax("/Checkout/GetAddresses").then((response) => {
            return response.json();
        }).then((options) => {
            EcommerceClassRepo.applyDropdownList(billingID, options);
            EcommerceClassRepo.applyDropdownList(shippingID, options);
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
        });
    }

    async getAddress(addressID): Promise<Address> {
        return EcommerceClassRepo.ajax("/Checkout/GetAddress", {
            method: "POST",
            body: EcommerceClassRepo.getJSON(addressID),
            headers: EcommerceClassRepo.getPostHeaders()
        }).then((response) => {
            return response.json();
        }).then((address) => {
            return address;
        }).catch((error) => {
            document.body.dispatchEvent(EcommerceClassRepo.showAlertEvent(error.message));
            return null as any;
        });
    }
}