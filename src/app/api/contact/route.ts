import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, phone, subject, message } = await req.json();
    
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required' }, { status: 400 });
    }
    
    const submission = await Contact.create({
      name,
      email,
      phone,
      subject: subject || 'New Contact Form Submission',
      message
    });
    
    // Attempt to send email
    try {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const adminEmail = process.env.ADMIN_EMAIL || emailUser;
      
      if (emailUser && emailPass && adminEmail) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });
        
        await transporter.sendMail({
          from: `"${name}" <${emailUser}>`,
          to: adminEmail,
          replyTo: email,
          subject: `Vivasaya Ullagam - ${subject || 'New Submission'}`,
          text: `You have received a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`
        });
      }
    } catch (emailErr) {
      console.error('Nodemailer failed, but contact was stored in DB:', emailErr);
    }
    
    return NextResponse.json({ success: true, message: 'Message sent successfully!', submission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit form' }, { status: 400 });
  }
}
