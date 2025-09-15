"use client"

import Link from "next/link"
import { Heart, Github, Twitter, Mail, Instagram, Linkedin } from "lucide-react"
import { motion } from "framer-motion"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2 mb-4"
            >
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">MannSahay</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-400 mb-4 max-w-md"
            >
              Your mental health companion designed for Indian students.
              Providing support, resources, and counseling in a safe,
              confidential environment.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex space-x-4"
            >
              {[
                { icon: Github, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Mail, href: "#" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="h-6 w-6" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Features", href: "#features" },
                { name: "About Us", href: "#about" },
                { name: "Contact", href: "#contact" },
                { name: "Sign In", href: "/auth/signin" },
              ].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <span className="h-0.5 w-0 bg-blue-500 mr-2 group-hover:w-2 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {[
                { name: "Mental Health Guide", href: "#" },
                { name: "Crisis Helplines", href: "#" },
                { name: "Wellness Exercises", href: "#" },
                { name: "FAQ", href: "#" },
              ].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <span className="h-0.5 w-0 bg-blue-500 mr-2 group-hover:w-2 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} MannSahay. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <motion.span whileHover={{ color: "#fff" }} className="cursor-pointer">
              Privacy Policy
            </motion.span>
            <motion.span whileHover={{ color: "#fff" }} className="cursor-pointer">
              Terms of Service
            </motion.span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
