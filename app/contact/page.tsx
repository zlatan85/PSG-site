'use client';

import { useState } from 'react';
import { FadeIn, ScaleIn } from '../../components/MotionWrapper';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      title: 'Adresse',
      content: '24 Rue du Commandant Guilbaud, 75016 Paris, France',
      icon: '📍'
    },
    {
      title: 'Téléphone',
      content: '+33 1 47 43 70 00',
      icon: '📞'
    },
    {
      title: 'Email',
      content: 'contact@psg.fr',
      icon: '✉️'
    },
    {
      title: 'Heures d\'ouverture',
      content: 'Lundi - Vendredi: 9h00 - 18h00',
      icon: '🕒'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn delay={0.2}>
          <div className="matchday-hero rounded-3xl p-8 sm:p-10 lg:p-12 mb-12">
            <div className="matchday-tape">Contact</div>
            <div className="matchday-orb left matchday-float" />
            <div className="matchday-orb right matchday-float" />
            <div className="space-y-4">
              <h1 className="font-display text-5xl uppercase text-white sm:text-6xl">
                Parlons PSG
              </h1>
              <p className="text-gray-300 max-w-2xl">
                Billetterie, partenariats, presse ou support: notre equipe est la pour vous.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Billets', 'Partenariats', 'Presse', 'Support'].map((item) => (
                  <span key={item} className="rounded-full bg-white/10 px-4 py-1 text-xs text-gray-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <FadeIn delay={0.4}>
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Nous contacter</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <ScaleIn key={index} delay={0.6 + index * 0.1}>
                    <div className="glass rounded-lg p-6 border border-white/10">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{info.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                          <p className="text-gray-300">{info.content}</p>
                        </div>
                      </div>
                    </div>
                  </ScaleIn>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Suivez-nous</h3>
                <div className="flex gap-4">
                  {['Twitter', 'Facebook', 'Instagram', 'YouTube'].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="glass rounded-lg px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Contact Form */}
          <FadeIn delay={0.5}>
            <div className="glass rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Envoyer un message</h2>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-green-400 text-4xl mb-4">✓</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message envoye !</h3>
                  <p className="text-gray-300">Merci, on revient vers vous rapidement.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      placeholder="vous@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Sujet *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    >
                      <option value="" className="bg-gray-800">Choisir un sujet</option>
                      <option value="tickets" className="bg-gray-800">Billetterie</option>
                      <option value="membership" className="bg-gray-800">Abonnements</option>
                      <option value="partnerships" className="bg-gray-800">Partenariats</option>
                      <option value="media" className="bg-gray-800">Presse</option>
                      <option value="other" className="bg-gray-800">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                      placeholder="Votre message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    {isSubmitting ? 'Envoi...' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
