"use strict";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error(
        "La variable de entorno STRIPE_SECRET_KEY no está configurada",
    );
}

const stripe = require("stripe")(stripeSecretKey);

function calcDiscount(price, discount) {
    if (!discount) return price;

    const discountAmount = (price * discount) / 100;
    const result = price - discountAmount;

    return result.toFixed(2);
}

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
    async paymentOrder(ctx) {
        const { token, products, idUser, addressShipping } = ctx.request.body;

        let totalPayment = 0;
        products.forEach((product) => {
            const priceTemp = calcDiscount(product.price, product.discount);
            totalPayment += Number(priceTemp) * Number(product.quantity);
        });

        const charge = await stripe.charges.create({
            amount: Math.round(totalPayment * 100),
            currency: "usd",
            source: token.id,
            description: `User ID: ${idUser}`,
        });

        const data = {
            products,
            user: idUser,
            totalPayment,
            idPayment: charge.id,
            addressShipping,
        };

        const model = strapi.contentType("api::order.order");

        await strapi.contentAPI.validate.input(data, model, {
            auth: ctx.state.auth,
        });

        const sanitizedData = /** @type {any} */ (
            await strapi.contentAPI.sanitize.input(data, model, {
                auth: ctx.state.auth,
            })
        );

        const entry = await strapi
            .documents("api::order.order")
            .create({ data: sanitizedData });

        const sanitizedEntry = await strapi.contentAPI.sanitize.output(
            entry,
            model,
            {
                auth: ctx.state.auth,
            },
        );

        return sanitizedEntry;
    },
}));
