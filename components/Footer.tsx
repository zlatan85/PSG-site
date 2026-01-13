import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-red-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">PSG News</h3>
            <p className="text-gray-300 mb-4">
              Your ultimate source for Paris Saint-Germain news, updates, and analysis.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.59.12 4.694.265 3.954.52c-.79.27-1.46.637-2.128 1.304C.637 2.486.27 3.156.002 3.946c-.255.74-.39 1.636-.443 2.836C-.014 7.996 0 8.396 0 12.017s-.014 4.021.067 5.227c.053 1.206.188 2.102.443 2.842.27.79.637 1.46 1.304 2.128.668.668 1.338 1.035 2.128 1.304.74.255 1.636.39 2.836.443C7.996 24.014 8.396 24 12.017 24s4.021-.014 5.227-.067c1.206-.053 2.102-.188 2.842-.443.79-.27 1.46-.637 2.128-1.304.668-.668 1.035-1.338 1.304-2.128.255-.74.39-1.636.443-2.836.067-1.206.067-1.606.067-5.227s.014-4.021-.067-5.227c-.053-1.206-.188-2.102-.443-2.842-.27-.79-.637-1.46-1.304-2.128C22.486.637 21.816.27 21.026.002c-.74-.255-1.636-.39-2.836-.443C16.021-.014 15.621 0 12.017 0zm0 2.267c3.57 0 3.99.013 5.397.067 1.326.053 2.066.28 2.55.467.634.24 1.086.532 1.568.999.482.467.774.919.999 1.568.187.484.414 1.224.467 2.55.067 1.407.067 1.827.067 5.397s-.013 3.99-.067 5.397c-.053 1.326-.28 2.066-.467 2.55-.225.649-.517 1.101-.999 1.568-.482.467-.934.759-1.568.999-.484.187-1.224.414-2.55.467-1.407.067-1.827.067-5.397.067s-3.99-.013-5.397-.067c-1.326-.053-2.066-.28-2.55-.467-.634-.24-1.086-.532-1.568-.999-.482-.467-.774-.919-.999-1.568-.187-.484-.414-1.224-.467-2.55-.067-1.407-.067-1.827-.067-5.397s.013-3.99.067-5.397c.053-1.326.28-2.066.467-2.55.225-.649.517-1.101.999-1.568.482-.467.934-.759 1.568-.999.484-.187 1.224-.414 2.55-.467 1.407-.067 1.827-.067 5.397-.067zm0 7.733c-3.791 0-6.867 3.076-6.867 6.867S8.226 23.734 12.017 23.734 18.884 20.658 18.884 16.867s-3.076-6.867-6.867-6.867zm0 11.334c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5zm7.733-14.4c0 .935-.759 1.694-1.694 1.694s-1.694-.759-1.694-1.694.759-1.694 1.694-1.694 1.694.759 1.694 1.694z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/news" className="text-gray-300 hover:text-white transition-colors">Latest News</Link></li>
              <li><Link href="/squad" className="text-gray-300 hover:text-white transition-colors">Squad</Link></li>
              <li><Link href="/calendar" className="text-gray-300 hover:text-white transition-colors">Match Calendar</Link></li>
              <li><Link href="/transfers" className="text-gray-300 hover:text-white transition-colors">Transfers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@psgnews.com</li>
              <li>Phone: +33 1 23 45 67 89</li>
              <li>Address: Paris, France</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-8 text-center text-gray-300">
          <p>&copy; 2024 PSG News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}