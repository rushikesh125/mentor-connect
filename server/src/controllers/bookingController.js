// src/controllers/bookingController.js
import Session from '../models/Session.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateZoomLink } from '../utils/generateZoomLink.js';
import { generateICS } from '../utils/generateICS.js';

export const bookSession = async (req, res) => {
  const { mentorId, startTime, topic } = req.body;
  const menteeId = req.user.id;

  try {
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor' || !mentor.isApproved) {
      return res.status(400).json({ message: 'Invalid or unapproved mentor' });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

    // Check conflict
    const conflict = await Session.findOne({
      mentor: mentorId,
      status: 'scheduled',
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const zoomLink = generateZoomLink(Date.now().toString());
    const session = await Session.create({
      mentee: menteeId,
      mentor: mentorId,
      startTime: start,
      endTime: end,
      topic,
      zoomLink,
    });

    const populatedSession = await Session.findById(session._id)
      .populate('mentee', 'email profile.fullName')
      .populate('mentor', 'email profile.fullName');

    const icsContent = generateICS(populatedSession);
    if (icsContent) {
      console.log('CALENDAR INVITE (.ics):');
      console.log(icsContent);
      console.log('---');
    }

    // Email mentee
    await sendEmail({
      to: populatedSession.mentee.email,
      subject: 'Session Confirmed!',
      html: `
        <h3>Your session is booked!</h3>
        <p><strong>Mentor:</strong> ${populatedSession.mentor.profile.fullName}</p>
        <p><strong>Time:</strong> ${start.toLocaleString()}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><a href="${zoomLink}">Join Zoom Meeting</a></p>
      `,
      attachments: icsContent ? [{ filename: 'session.ics', content: icsContent }] : [],
    });

    // Email mentor
    await sendEmail({
      to: populatedSession.mentor.email,
      subject: 'New Session Booking',
      html: `
        <p>You have a new session with <strong>${populatedSession.mentee.profile.fullName}</strong></p>
        <p><strong>Time:</strong> ${start.toLocaleString()}</p>
        <p><strong>Topic:</strong> ${topic}</p>
      `,
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserSessions = async (req, res) => {
  const userId = req.user.id;
  try {
    const sessions = await Session.find({
      $or: [{ mentee: userId }, { mentor: userId }],
    })
      .populate('mentee', 'profile.fullName email')
      .populate('mentor', 'profile.fullName email')
      .sort({ startTime: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeSession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await Session.findById(sessionId);
    if (!session || session.status !== 'scheduled') {
      return res.status(400).json({ message: 'Invalid session' });
    }

    const userId = req.user.id;
    if (session.mentee.toString() !== userId && session.mentor.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = 'completed';
    await session.save();

    res.json({ message: 'Session marked as completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};