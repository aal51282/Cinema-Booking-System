import { Link } from "react-router-dom";
import { useState } from "react";
import { EmailInput, FormattedInput, PhoneInput } from '@/components/custom/FormattedInput';
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CardEditor from "@/components/custom/CardEditor";
import { CardInformation } from "@/util/types";
import axios from "axios";

export default function Register() {
  const [formData, updateFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    promotionsEnabled: false,
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    },
    cards: [] as (CardInformation)[]
  });

  const [valid, setValid] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });

  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  const validateForm = () => {
    return Object.values(valid).every(value => value);
  }

  const handleAddCard = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (formData.cards.length < 3) {
      updateFormData({
        ...formData,
        cards: [...formData.cards, { cardNumber: '', cardHolderName: '', expirationDate: '', cvv: '', billingAddress: null }] as CardInformation[]
      });
    }
  };

  const handleDeleteCard = (index: number) => {
    const updatedCards = formData.cards.filter((_, i) => i !== index);
    updateFormData({ ...formData, cards: updatedCards });
  };

  const handleCardChange = (index: number, newCard: CardInformation) => {
    const updatedCards = formData.cards.map((card, i) => (i === index ? newCard : card));
    updateFormData({ ...formData, cards: updatedCards });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const formattedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        promotionsEnabled: formData.promotionsEnabled,
        billingAddress: formData.billingAddress,
        payments: formData.cards,
      };

      console.log(formattedData);
  
      try {
        console.log(formattedData)
        const response = await axios.post('http://localhost:3000/api/auth/register', formattedData);
  
        console.log('Registration successful:', response.data);
        console.log(`Data: ${JSON.stringify(formattedData, null, 2)}`);
        setWaitingForConfirmation(true);
      } catch (error:any) {
        console.error('Error during registration:', error);
        alert(error.response.data.message)
      }
    } else {
      console.log("Form is not valid");
    }
  };

  return (
    <div className="min-h-full bg-black flex flex-col justify-center items-center p-4">
      
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Register</h2>
        </div>
        {waitingForConfirmation && <Card className="p-8 max-w-lg w-full bg-green-500 border-none flex flex-col justify-center items-center">
            <h2 className=" text-2xl font-bold text-white">Registration Successful</h2>
            <p className="text-lg text-white">Please check your email for a verification link.</p>
        </Card>}
        <form onSubmit={handleSubmit}>
            <FormattedInput className="rounded-b-none" onChange={(newValue: string | null) => {
              if (newValue) {
                updateFormData({
                  ...formData, 
                  firstName: newValue
                })
                setValid({
                  ...valid,
                  firstName: true
                });
              } else {
                setValid({
                  ...valid,
                  firstName: false
                });
              }
            }} 
            required={true}
            placeholder="First Name"
            validator={(input: string) => input.length >= 1}
            errorMessage="First name must be at least 1 character"
            />
            <FormattedInput onChange={(newValue: string | null) => {
              if (newValue) {
                updateFormData({
                  ...formData, 
                  lastName: newValue
                })
                setValid({
                  ...valid,
                  lastName: true
                });
              } else {
                setValid({
                  ...valid,
                  lastName: false
                });
              }
            }} 
            placeholder="Last Name"
            required={true}
            validator={(input: string) => input.length >= 1}
            errorMessage="Last name must be at least 1 character"
            className="rounded-none"
            />
          <EmailInput className="rounded-none" onChange={(newValue: string | null) => {
            if (newValue) {
              updateFormData({
                ...formData, 
                email: newValue
              })
              setValid({
                ...valid,
                email: true
              });
            } else {
              setValid({
                ...valid,
                email: false
              });
            }
          }}
          required={true}
          />
          <PhoneInput onChange={(newValue: string | null) => {
            if (newValue) {
              updateFormData({
                ...formData, 
                phone: newValue
              })
              setValid({
                ...valid,
                phone: true
              });
            } else {
              setValid({
                ...valid,
                phone: false
              });
            }
          }}
          required={true}
            className="rounded-none"
          />
          <FormattedInput
            placeholder="Password"
            onChange={(newValue: string | null) => {
              if (newValue) {
                updateFormData({
                  ...formData, 
                  password: newValue
                })
                setValid({
                  ...valid,
                  password: true
                });
              } else {
                setValid({
                  ...valid,
                  password: false
                });
              }
            }}
            errorMessage="Invalid password"
            type="password"
            validator={(input: string) => input.length >= 8}
            required={true}
            className="rounded-none"
          />
          <FormattedInput
            placeholder="Confirm Password"
            onChange={(newValue: string | null) => {
              if (newValue) {
                updateFormData({
                  ...formData, 
                  confirmPassword: newValue
                })
                setValid({
                  ...valid,
                  confirmPassword: true
                });
              } else {
                setValid({
                  ...valid,
                  confirmPassword: false
                });
              }
            }}
            errorMessage="Passwords do not match"
            type="password"
            validator={(input: string) => input === formData.password}
            className="rounded-t-none"
            required={true}
          />
          
          <div className="relative mt-4 mb-2">
            <label className="text-white text-lg font-medium">
              Home Address
            </label>
          </div>
          <FormattedInput
            placeholder="Street Address"
            className="rounded-b-none"
            onChange={(newValue: string | null) => updateFormData({
              ...formData,
              billingAddress: { ...formData.billingAddress, street: newValue || "" }
            })}
          />
          <FormattedInput
            placeholder="City"
            onChange={(newValue: string | null) => updateFormData({
              ...formData,
              billingAddress: { ...formData.billingAddress, city: newValue || "" }
            })}
            className="rounded-none"
          />
          <FormattedInput
            placeholder="State"
            onChange={(newValue: string | null) => updateFormData({
              ...formData,
              billingAddress: { ...formData.billingAddress, state: newValue || "" }
            })}
            className="rounded-none"
          />
          <FormattedInput
            placeholder="Zip Code"
            onChange={(newValue: string | null) => updateFormData({
              ...formData,
              billingAddress: { ...formData.billingAddress, zipCode: newValue || "" }
            })}
            className="rounded-t-none"
          />
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="promotions"
              checked={formData.promotionsEnabled}
              onCheckedChange={(checked:boolean) => updateFormData({ ...formData, promotionsEnabled: checked })}
              className="border-white"
            />
            <label
              htmlFor="promotions"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
            > 
              Sign up for promotional emails
            </label>
          </div>

          <div className="mt-4 text-white">
            <Accordion type="single" collapsible>
              <AccordionItem value="card-info">
                <AccordionTrigger>Card Information (Optional)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  {formData.cards.map((_, index) => (
                    <CardEditor key={index} onChange={(newCard) => handleCardChange(index, newCard)} onDelete={() => handleDeleteCard(index)}/>
                  ))}
                  {formData.cards.length < 3 && (
                    <button onClick={handleAddCard} className="mt-2 bg-red-600 text-white p-2 rounded-md">
                      Add Card
                    </button>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
                    
          <button type="submit" className="w-full bg-red-600 text-white p-2 rounded-md mt-4 disabled:opacity-50" disabled={!validateForm()}>Register</button>
        </form>
        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link to="../login" className="font-medium text-[#BA0C2F] hover:text-[#FF8F8F]">
              Already have an account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
