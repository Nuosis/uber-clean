import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { IconButton } from '../UI Elements/Button';
import HeaderCard from '../UI Elements/HeaderCard';
import Popup from '../UI Elements/Popup';

const CreditCardForm = ({ token, userData, onSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '' });

  const headerTextStyle = {

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js has not yet loaded.
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
      },
    });

    if (error) {
      console.error('Error creating payment method:', error);
      setPopup({ show: true, message: 'Failed to create payment method.' });
      return;
    }

    const stripeData = JSON.parse(userData.userData.userDetails.stripeInfo[0].data);
    const params = {
      paymentMethodId: paymentMethod.id,
      customerId: stripeData.id,
    };

    try {
      const response = await fetch('https://server.claritybusinesssolutions.ca:4343/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ method: 'addPaymentMethod', params }),
      });

      if (response.ok) {
          const result = await response.json();
          setPopup({ show: true, message: 'Payment method added successfully!' });
          onSubmit();
      } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add payment method');
      }
    } catch (error) {
      console.error('Failed to add payment method:', error);
      setPopup({ show: true, message: 'Failed to add payment method.' });
    }
  };

  return (
    <div className="flex flex-col items-start justify-center flex-grow">
      {popup.show && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50" style={{ zIndex: 30 }}>
          <Popup message={popup.message} onClose={() => setPopup({ ...popup, show: false })} />
        </div>
      )}
      <HeaderCard headerText="Update Credit Card" headerTextStyle={headerTextStyle}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div>
            <label className="block text-sm font-bold text-primary dark:text-gray-400">Cardholder Name</label>
            <input
              type="text"
              placeholder="Card number..."
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary dark:text-gray-400">Card Details</label>
            <CardElement className="mt-1 min-h-10 block w-full px-3 py-2 bg-white border border-gray-300 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <IconButton 
            icon="CreditCard"
            className="btn btn-primary mb-4 block"
            type="submit"
            text="Submit Payment" 
            />
        </form>
      </HeaderCard>
      </div>
  );
};

export default CreditCardForm;
