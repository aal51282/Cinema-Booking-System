import { useState, useEffect } from "react";
import { FormattedInput } from "./FormattedInput";
import { CardInformation } from "@/util/types";
import { FaTrash } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CardEditorProps {
  onChange: (card: CardInformation & { sameAsHomeAddress: boolean }) => void;
  onDelete?: () => void;
  cardData?: CardInformation;
}

type AddressStructure = {
  street: string,
  city: string,
  state: string,
  zipCode: string
}

export default function CardEditor({
  onChange,
  onDelete,
  cardData,
}: CardEditorProps) {
  const [sameAsHomeAddress, setSameAsHomeAddress] = useState(!cardData?.billingAddress);

  let initialBillingAddress = {
    street: '',
    city: '',
    state: '',
    zipCode: ''
  }

  if(cardData && cardData.billingAddress) {
    initialBillingAddress = JSON.parse(cardData.billingAddress)
  }
  
  const [billingAddress, setBillingAddress] = useState<AddressStructure>(initialBillingAddress);

  // Initialize card state with cardData if provided
  const [card, setCard] = useState<CardInformation>(
    cardData || {
      card_id: null,
      cardType: 'Visa',
      cardNumber: '',
      cardHolderName: '',
      expirationDate: '',
      cvv: '',
      isDefault: false,
      billingAddress: null
    }
  );

  const updateCard = (newCard: CardInformation) => {
    setCard(newCard);
    onChange({ ...newCard, sameAsHomeAddress });
  };

  const handleAddressChange = (field: string, value: string) => {
    setBillingAddress(({ ...billingAddress, [field]: value } as AddressStructure));
    updateCard({...card, billingAddress: sameAsHomeAddress?null:JSON.stringify(billingAddress)});
  };

  const toggleDefaultAddress = () => {
    updateCard({...card, billingAddress: !sameAsHomeAddress?null:JSON.stringify(billingAddress)});
    setSameAsHomeAddress(!sameAsHomeAddress);
  };

  return (
    <div className="bg-darkgray-800 border border-darkgray-600 p-6 rounded-lg shadow-md relative">
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-4 right-4 text-white"
          title="Delete Card"
        >
          <FaTrash size={14} className="text-red-600 opacity-50 hover:opacity-100" />
        </button>
      )}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label htmlFor="cardType" className="text-darkgray-300">Card Type</label>
          <Select defaultValue={card.cardType} onValueChange={(value) => updateCard({ ...card, cardType: value as any })}>
            <SelectTrigger className="w-full bg-darkgray-700 border-darkgray-600 text-darkgray-300">
              <SelectValue placeholder="Card Type" className="border-darkgray-600" />
            </SelectTrigger>
            <SelectContent className="bg-darkgray-700 border-darkgray-600  text-darkgray-300">
              <SelectItem className="data-[highlighted]:bg-darkgray-600 data-[highlighted]:text-darkgray-300" value="Visa">Visa</SelectItem>
              <SelectItem className="data-[highlighted]:bg-darkgray-600 data-[highlighted]:text-darkgray-300" value="MasterCard">Master Card</SelectItem>
              <SelectItem className="data-[highlighted]:bg-darkgray-600 data-[highlighted]:text-darkgray-300" value="Amex">Amex</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="cardNumber" className="text-darkgray-300">Card Number</label>
          <FormattedInput
            onChange={(value) => updateCard({ ...card, cardNumber: value ? value.replace(/[^0-9]/g, '').slice(0, 16) : '' })}
            className="bg-darkgray-700 text-white border-darkgray-600 w-full"
            placeholder="Card Number"
            formatter={(value: string) => {
              const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 16);
              return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
            }}
            initialValue={card.cardNumber}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="cardHolderName" className="text-darkgray-300">Cardholder Name</label>
          <FormattedInput
            onChange={(value) => updateCard({ ...card, cardHolderName: value || '' })}
            className="bg-darkgray-700 text-white border-darkgray-600 w-full"
            placeholder="Cardholder Name"
            initialValue={card.cardHolderName}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="expirationDate" className="text-darkgray-300">Expiration Date</label>
            <FormattedInput
              onChange={(value) => updateCard({ ...card, expirationDate: value ? value.replace(/[^0-9]/g, '').slice(0, 4).replace(/(.{2})(.{2})/, '$1/$2') : '' })}
              className="bg-darkgray-700 text-white border-darkgray-600 w-full"
              placeholder="MM/YY"
              formatter={(value: string) => {
                const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
                return digitsOnly.replace(/(.{2})(.{2})/, '$1/$2');
              }}
              errorMessage="Expiration date must be in the future"
              initialValue={card.expirationDate}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cvv" className="text-darkgray-300">CVV</label>
            <FormattedInput
              onChange={(value) => updateCard({ ...card, cvv: value ? value.replace(/[^0-9]/g, '').slice(0, 3) : '' })}
              className="bg-darkgray-700 text-white border-darkgray-600 w-full"
              placeholder="CVV"
              type="password"
              formatter={(value: string) => value.replace(/[^0-9]/g, '').slice(0, 3)}
              errorMessage="CVV must be 3 digits"
              initialValue={card.cvv}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="sameAsHomeAddress"
            checked={sameAsHomeAddress}
            onCheckedChange={() => toggleDefaultAddress()}
            className="border-white"
          />
          <label
            htmlFor="sameAsHomeAddress"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
          >
            Billing address is the same as home address
          </label>
        </div>
        {!sameAsHomeAddress && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="relative">
              <label className="text-darkgray-300 text-lg font-medium">
                Billing Address
              </label>
            </div>
            {billingAddress.street !== undefined && <FormattedInput
              placeholder="Street Address"
              className="bg-darkgray-700 text-white border-darkgray-600 w-full"
              onChange={(newValue: string | null) => handleAddressChange('street', newValue || "")}
              initialValue={billingAddress?billingAddress.street:''}
            />}
            {billingAddress.city !== undefined && <FormattedInput
              placeholder="City"
              className="bg-darkgray-700 text-white border-darkgray-600 w-full"
              onChange={(newValue: string | null) => handleAddressChange('city', newValue || "")}
              initialValue={billingAddress?billingAddress.city:''}
            />}
            {billingAddress.state !== undefined && <FormattedInput
              placeholder="State"
              className="bg-darkgray-700 text-white border-darkgray-600 w-full"
              onChange={(newValue: string | null) => handleAddressChange('state', newValue || "")}
              initialValue={billingAddress?billingAddress.state:''}
            />}
            {billingAddress.zipCode !== undefined && <FormattedInput
              placeholder="Zip Code"
              className="bg-darkgray-700 text-white border-darkgray-600 w-full"
              onChange={(newValue: string | null) => handleAddressChange('zipCode', newValue || "")}
              initialValue={billingAddress?billingAddress.zipCode:''}
            />}
          </div>
        )}

      </div>
    </div>
  );
}
