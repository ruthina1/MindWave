import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:mindwave_mobile/theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  late final GenerativeModel _model;
  late final ChatSession _chat;
  
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;

  // Speech to Text
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  bool _hasSpeechAvailable = false;

  @override
  void initState() {
    super.initState();
    
    // Initialize Gemini with the provided API key
    _model = GenerativeModel(
      model: 'gemini-2.5-flash',
      apiKey: dotenv.env['GEMINI_API_KEY'] ?? '',
      systemInstruction: Content.system("You are MindWave AI, a compassionate, professional, and empathetic AI therapist. Keep your responses concise, helpful, and focused on the user's emotional wellbeing. Do not provide medical diagnoses."),
    );
    
    _chat = _model.startChat();
    
    // Initialize Speech to Text
    _initSpeech();
    
    // Add initial greeting
    _messages.add({
      'isUser': false,
      'text': "Hi Abenezer, I'm your MindWave companion. I noticed you had a brief spike in anxiety earlier today. How are you feeling right now? You can type or use the microphone to talk to me.",
      'time': _formatCurrentTime(),
    });
  }

  Future<void> _initSpeech() async {
    bool available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'done' || status == 'notListening') {
          setState(() => _isListening = false);
        }
      },
      onError: (errorNotification) {
        print('Speech error: $errorNotification');
        setState(() => _isListening = false);
      },
    );
    setState(() {
      _hasSpeechAvailable = available;
    });
  }

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (val) => print('onStatus: $val'),
        onError: (val) => print('onError: $val'),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) {
            setState(() {
              _textController.text = val.recognizedWords;
            });
            if (val.hasConfidenceRating && val.confidence > 0) {
              // We could automatically send here, but it's better to let the user review
              // and press send.
            }
          },
        );
      } else {
        setState(() => _isListening = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Microphone permission denied or speech recognition unavailable.'))
          );
        }
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    if (_isListening) {
      _speech.stop();
      setState(() => _isListening = false);
    }

    final message = _textController.text.trim();
    if (message.isEmpty) return;

    _textController.clear();
    
    setState(() {
      _messages.add({
        'isUser': true,
        'text': message,
        'time': _formatCurrentTime(),
      });
      _isLoading = true;
    });
    
    _scrollToBottom();

    try {
      final response = await _chat.sendMessage(Content.text(message));
      
      setState(() {
        _messages.add({
          'isUser': false,
          'text': response.text ?? "I'm here for you. Could you tell me a little more?",
          'time': _formatCurrentTime(),
        });
        _isLoading = false;
      });
      
      _scrollToBottom();
    } catch (e) {
      print('Gemini API Error: $e');
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Failed to connect to MindWave AI. Please check your network.', style: TextStyle(fontWeight: FontWeight.bold)),
            backgroundColor: AppTheme.angry,
            behavior: SnackBarBehavior.floating,
          )
        );
      }
    }
  }

  String _formatCurrentTime() {
    final now = DateTime.now();
    final hour = now.hour > 12 ? now.hour - 12 : (now.hour == 0 ? 12 : now.hour);
    final minute = now.minute.toString().padLeft(2, '0');
    final period = now.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.accent.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.bot, color: AppTheme.accent, size: 20),
            ),
            const SizedBox(width: 12),
            const Text('MindWave AI', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: -0.5)),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageBubble(msg['text'], msg['isUser'], msg['time']);
              },
            ),
          ),
          if (_isLoading)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSecondary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      children: [
                        SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accent)),
                        SizedBox(width: 12),
                        Text('AI is typing...', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isUser, String time) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            const CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.bgTertiary,
              child: Icon(LucideIcons.bot, size: 16, color: AppTheme.accent),
            ),
            const SizedBox(width: 12),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isUser ? AppTheme.accent : AppTheme.bgSecondary,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isUser ? 20 : 4),
                  bottomRight: Radius.circular(isUser ? 4 : 20),
                ),
                // No border line
              ),
              child: Column(
                crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  Text(
                    text,
                    style: TextStyle(
                      color: isUser ? Colors.white : AppTheme.textPrimary,
                      fontSize: 14,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    time,
                    style: TextStyle(
                      color: isUser ? Colors.white.withValues(alpha: 0.7) : AppTheme.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(12).copyWith(bottom: 24),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        // No border line
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppTheme.bgPrimary,
                borderRadius: BorderRadius.circular(24),
                // No border line
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(color: AppTheme.textPrimary),
                      decoration: const InputDecoration(
                        hintText: 'Type or speak your message...',
                        hintStyle: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                        border: InputBorder.none,
                      ),
                      onSubmitted: (_) => _sendMessage(),
                      onChanged: (val) {
                        setState(() {}); // Trigger rebuild to show/hide send button based on text
                      },
                    ),
                  ),
                  if (_hasSpeechAvailable)
                    GestureDetector(
                      onTap: _listen,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        child: Icon(
                          _isListening ? LucideIcons.micOff : LucideIcons.mic,
                          color: _isListening ? AppTheme.angry : AppTheme.textSecondary,
                          size: 22,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: _sendMessage,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: (_textController.text.isNotEmpty || _isListening) ? AppTheme.accent : AppTheme.bgTertiary,
                shape: BoxShape.circle,
                boxShadow: (_textController.text.isNotEmpty || _isListening) ? [
                  BoxShadow(
                    color: AppTheme.accent.withValues(alpha: 0.3),
                    blurRadius: 10,
                    spreadRadius: 2,
                  )
                ] : null,
              ),
              child: Icon(
                LucideIcons.send, 
                color: (_textController.text.isNotEmpty || _isListening) ? Colors.white : AppTheme.textSecondary, 
                size: 16
              ),
            ),
          ),
        ],
      ),
    );
  }
}
