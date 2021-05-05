    const express = require('express');
    const cors = require('cors');
    const request = require('request');
    
    const app = express();
    app.use(express.urlencoded({ extended: true }))
    app.use(cors())
    
    /*  */
    const CLIENT = 'AYK0L4x3o8XmafO4CqaL7wbcrmw-Z_GST_jBS06bjB8vFA1KE0cREPFKMVBdrQum_hiEYRAK2WtlGnNk';
    const SECRET = 'EIGdH83i99UdAhDYk43yi4m1ZK4PaQM_4szwLnLAO43mPTh0oRDa7SWSkUBeZQClche2tBI_yUtl2Pvq';
    const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Live https://api-m.paypal.com
    
    const auth = { user: CLIENT, pass: SECRET }
    
    /*
    * Se establecen los controladores a usar
    */
    const createPayment = (req, res) => {
    
        const body = {
            intent: 'CAPTURE', //require 'CAPTURE' o 'AUTHORIZE'
            purchase_units: [{ 
                amount: { //required
                    currency_code: 'USD',
                    value: '25',
                }
            }],
            application_context: {
                brand_name: `MiTienda.com`,
                landing_page: 'NO_PREFERENCE', 
                user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
                return_url: `https://apipersonal11.herokuapp.com/execute-payment`, // Url despues de realizar el pago
                cancel_url: `https://apipersonal11.herokuapp.com/cancel-payment` // Url despues de realizar el pago
            }
        }
    
        request.post(`${PAYPAL_API}/v2/checkout/orders`, {
            auth,
            body,
            json: true
        }, (err, response) => {
            res.json({ data: response.body})
        })

    }
    
    /*
    * Esta funcion captura el pago
    */
    const executePayment = (req, res) => {
        const token = req.query.token;
    
        request.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
            auth,
            body: {},
            json: true
        }, (err, response) => {
            res.json({ data: response.body })
        })
    }

    const createWebhook = (req, res) => {

        const body = {
            url: "https://apipersonal11.herokuapp.com/",
            event_types: [
            {
                name: "PAYMENT.AUTHORIZATION.CREATED"
            },
            {
                name: "PAYMENT.AUTHORIZATION.VOIDED"
            },
            {
                name: "PAYMENT.CAPTURE.COMPLETED"
            },
            {
                name: "PAYMENT.CAPTURE.DENIED"
            },
            {
                name: "PAYMENT.CAPTURE.PENDING"
            },
            {
                name: "PAYMENT.CAPTURE.REFUNDED"
            },
            {
                name: "PAYMENT.CAPTURE.REVERSED"
            }]
      }

        request.post(`${PAYPAL_API}/v1/notifications/webhooks`, {
            auth,
            body,
            json: true
        }, (err, response) => {
            res.json({data: response.body})
        })
    }
    
    const getWebhook = (req, res) => {

        request.get(`${PAYPAL_API}/v1/notifications/webhooks-events/WH-95U311137S980660P-0K965826SL355510P`, {
            auth,
            body: {},
            json: true
        }, (err, response) => {
            res.json({data: response.body})
        })
    }

    const simulateWebhookEvent = (res, req) => {

        const body = {
            webhook_id: "5KR85176Y3225820B",
            event_type: "PAYMENT.CAPTURE.COMPLETED",
            resource_version: "1.0"        
        }

        request.post(`${PAYPAL_API}/v1/notifications/simulate-event`, {
            auth,
            body,
            json: true
        }, (err, response) => {
            res.json({data: response.body})
        })
    }
    
    /**
     * Rutas
     */
    app.post(`/create-payment`, createPayment);
    
    app.get(`/execute-payment`, executePayment);

    app.post('/createWebhook', createWebhook);

    app.get('/getWebhook', getWebhook);

    app.post('/notification-Webhook', simulateWebhookEvent);

    app.set('port', process.env.PORT || 3000);
    
    app.listen(app.get('port'), () => {
        console.log(`Servidor en el puerto ${app.get('port')}`);
    })

