import { useState } from 'react';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';
import { Input } from '@shinkai_network/shinkai-ui';
import { Textarea } from '@shinkai_network/shinkai-ui';
import { SimpleLayout } from './layout/simple-layout';

const Feedback = () => {
  const { t } = useTranslation();
  const [formSuccess, setFormSuccess] = useState(false);

  return (
    <SimpleLayout classname="max-w-xl" title={t('feedback.title', 'Feedback')}>
      <div className="text-muted-foreground flex h-full w-full flex-col gap-8 text-sm">
        <section className="feedback-section">
          <p className="mb-4">
            {t('feedback.description', 'We value your feedback! Please let us know your thoughts about Shinkai and how we can improve your experience.')}
          </p>
          
          {formSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-4">
              {t('feedback.success', 'Thank you for your feedback! We\'ll get back to you soon.')}
            </div>
          ) : (
            <form
              action="https://formspree.io/f/mgvawbkv"
              method="POST"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target as HTMLFormElement);
                formData.append("source", "shinkai-desktop-app");
                
                fetch("https://formspree.io/f/mgvawbkv", {
                  method: "POST",
                  body: formData,
                  headers: {
                    Accept: "application/json",
                  },
                })
                  .then((response) => {
                    if (response.ok) {
                      setFormSuccess(true);
                    } else {
                      console.error("Form submission failed");
                      alert(t('feedback.error', 'Form submission failed. Please try again.'));
                    }
                  })
                  .catch((error) => {
                    console.error("Form submission error:", error);
                    alert(t('feedback.error', 'Form submission failed. Please try again.'));
                  });
              }}
            >
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium mb-1">
                  {t('feedback.feedbackLabel', 'Your Feedback')}
                </label>
                <Textarea 
                  id="feedback" 
                  name="feedback" 
                  placeholder={t('feedback.feedbackPlaceholder', 'Please share your thoughts, suggestions, or questions...')} 
                  required 
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="contact" className="block text-sm font-medium mb-1">
                  {t('feedback.contactLabel', 'Contact Information')}
                </label>
                <Input 
                  id="contact" 
                  name="contact" 
                  type="text" 
                  placeholder={t('feedback.contactPlaceholder', 'Email or phone number')} 
                  required 
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('feedback.contactHelp', 'How can we reach you if we have questions?')}
                </p>
              </div>
              
              <Button type="submit">
                {t('feedback.submit', 'Send Feedback')}
              </Button>
            </form>
          )}
        </section>
      </div>
    </SimpleLayout>
  );
};

export default Feedback;
