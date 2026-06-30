// app/page.tsx
"use client"

import { useState, useEffect } from "react";

export default function Home() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayPosition, setDisplayPosition] = useState(0);
  const [showFullQuote, setShowFullQuote] = useState(false);
  
  // Array of quotes - using precomposed characters
  const quotes = [
    {
      text: "1 ... ἢ ἔρωτα ἤ τι λυπηρὸν οὐκ ἀνδρείου, ἀλλὰ μᾶλλον δειλοῦ: μαλακία γὰρ τὸ φεύγειν τὰ ἐπίπονα, καὶ οὐχ ὅτι καλὸν ...",
      citation: "(Ἀριστοτέλης - Νικομάχεια Ἠθική - βιβλίο 7)"
    },
    {
      text: "2 ... ἐν ἐξουσίᾳ μᾶλλον ὄντες ἢ ὅλως οἱ ἀδυνατώτεροι: πάντα γὰρ μαλακίας σημεῖα. καὶ τὸ ὑφ᾽ ἑτέρου εὖ πάσχειν, καὶ τὸ ...",
      citation: "(Ἀριστοτέλης - Νικομάχεια Ἠθική - βιβλίο 7)"
    },
    {
      text: "3 ... ἀφίστασθαι δὲ αὐτῶν διὰ τὰς ἡδονάς. ἀκολουθεῖ δὲ τῇ ἀκρασίᾳ μαλακία καὶ μεταμέλεια καὶ τὰ πλεῖστα ταὐτὰ ἃ καὶ τῇ ...",
      citation: "(Ἀριστοτέλης - Νικομάχεια Ἠθική - βιβλίο 7)"
    },
    {
      text: "4 ... εἶναι ὁπωσοῦν σωθῆναι ἢ τελευτῆσαι καλῶς. ἀκολουθεῖ δὲ τῇ δειλίᾳ μαλακία, ἀνανδρία, ἀπονία, φιλοψυχία. ὕπεστι δέ τις εὐλάβεια καὶ τὸ ...",
      citation: "(Πολιτεία τοῦ Πλάτωνος - βιβλίο 3)"
    },
    {
      text: "5 ... ἁπάντων δὲ κρατεῖν ἐν τοῖς πολέμοις, τούτους διὰ ῥᾳθυμίαν ἢ μαλακίαν ἐγκαταλείπειν τά τε τῶν προγόνων ἔργα καὶ τὰ συμφέροντα ...",
      citation: "(Πανηγυρικός τοῦ Ἰσοκράτους - Isocrates' Panegyricus)"
    },
    {
      text: "6 ... δὲ κατεγνώκασι μετὰ τούτων ἀδιήγητόν τινα τῆς πόλεως ἔκλυσιν καὶ μαλακίαν, καὶ οὔτε πρόνοιαν περὶ τῶν μελλόντων εἶναι, οὔτε λογισμὸν ...",
      citation: "(Ἀρεοπαγητικός τοῦ Ἰσοκράτους - Isocrates' Areopageticus)"
    },
    {
      text: "7 ... ἀπαιτεῖς παρ᾽ ἐμοῦ, καὶ οὐκ αἰσχύνει τὸν αὐτὸν εἴς τε μαλακίαν σκώπτων καὶ τῆς Φιλίππου δυνάμεως ἀξιῶν ἕν᾽ ὄντα κρείττω ...",
      citation: "(Περὶ τῶν ἐν Χερρονήσῳ τοῦ Δημοσθένους - Demosthenes' Chersonese)"
    },
    {
      text: "8 ... μοι δοκοῦσιν ἐν ἅπασι τοῖς τόποις σαφῶς ἐπιδεδεῖχθαι τὴν αὑτῶν μαλακίαν: καὶ γὰρ ἐν τῇ παραλίᾳ τῆς Ἀσίας πολλὰς μάχας ...",
      citation: "(1ος Φιλιππικός τοῦ Δημοσθένους - Demosthenes' 1st Philippic)"
    },
    {
      text: "9 ... τε δὲ ἔσεσθε ὑπερβαλόμενοι τοὺς ἐναντίους εἶναι ἐλεύθεροι: εἰ δὲ μαλακίῃ τε καὶ ἀταξίῃ διαχρήσησθε, οὐδεμίαν ὑμέων ἔχω ἐλπίδα μὴ ...",
      citation: "(Ἱστορίαι Ἡροδότου - Histories Book VII, chapter 9b)"
    },
    {
      text: "10 ... ἐπηκολούθησαν δὲ διώκοντες Αἰθίοπες καὶ μαλακίας ὑπολαβόντες τὸ μὴ κρατεῖν ἁπάσης τῆς Αἰγύπτου τῆς χώρας ...",
      citation: "(Ἱστορίαι Ἡροδότου - Histories III.21)"
    },
    {
      text: "11 ... ἴσμεν ὅπως τάδε τριῶν τῶν μεγίστων ξυμφορῶν ἀπήλλακται, ἀξυνεσίας ἢ μαλακίας ἢ ἀμελείας. οὐ γὰρ δὴ πεφευγότες αὐτὰ ἐπὶ τὴν ...",
      citation: "(Θουκυδίδης - Πελοποννησιακός Πόλεμος)"
    },
    {
      text: "12 ... φιλοκαλοῦμεν μετ᾽ εὐτελείας καὶ φιλοσοφοῦμεν ἄνευ μαλακίας ...",
      citation: "(Θουκυδίδης - Πελοποννησιακός Πόλεμος - Ἐπιτάφιος τοῦ Περικλέους)"
    },
    {
      text: "13 ... τὴν πόλιν ἐς μαλακίαν ἄγεις ...",
      citation: "(Ἀριστοφάνης - Ἱππεῖς - Knights, sense: leading the city into softness/political slackness)"
    },
    {
      text: "14 ... ἐν πολέμῳ μαλακίαν ἐπιδείκνυσθε ...",
      citation: "(Ἀριστοφάνης - Λυσιστράτη - Lysistrata, sense: showing softness in war, failure of martial firmness)"
    }
  ];

  // Typewriter effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!showFullQuote) {
      if (displayPosition < quotes[currentQuoteIndex].text.length) {
        // Type next character
        timer = setTimeout(() => {
          setDisplayPosition(displayPosition + 1);
        }, 50);
      } else {
        // Finished typing - show citation
        setShowFullQuote(true);
      }
    } else {
      // We are showing the full quote with citation
      // Wait 3 seconds then move to next quote
      timer = setTimeout(() => {
        const nextIndex = (currentQuoteIndex + 1) % quotes.length;
        setCurrentQuoteIndex(nextIndex);
        setDisplayPosition(0);
        setShowFullQuote(false);
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [displayPosition, showFullQuote, currentQuoteIndex, quotes]);

  // Function to render text with red/bold all forms of μαλακία
  const renderTextWithHighlight = (text: string) => {
    if (!text) return null;
    
    // Match all forms: μαλακία, μαλακίας, μαλακίᾳ, μαλακίαν, μαλακίῃ, etc.
    const parts = text.split(/(μαλακί[αηῳν][ηςνῳ]?|μαλακί[αηῳν]|μαλακίῃ)/i);
    
    return parts.map((part, index) => {
      // Check if this part matches any form of μαλακία (starts with μαλακί)
      if (part.toLowerCase().startsWith('μαλακί')) {
        return (
          <span key={index} style={{ color: '#dc2626', fontWeight: 'bold' }}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const currentText = quotes[currentQuoteIndex].text.substring(0, displayPosition);

  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Quote Section */}
      <div style={{ 
        width: '100%', 
        padding: '10px 0',
        backgroundColor: '#f9f5f0',
        borderBottom: '1px solid #ccc',
        borderTop: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ 
          maxWidth: '800px',
          width: '100%',
          height: '80px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ 
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#5d3a1a',
            fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
            textAlign: 'center',
            width: '100%'
          }}>
            {renderTextWithHighlight(currentText)}
            {!showFullQuote && displayPosition < quotes[currentQuoteIndex].text.length && (
              <span style={{ 
                display: 'inline-block',
                width: '2px',
                height: '20px',
                backgroundColor: '#5d3a1a',
                marginLeft: '2px',
                verticalAlign: 'middle'
              }}>|</span>
            )}
          </div>
          
          {/* Citation - directly below the text with no space */}
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
            textAlign: 'center',
            margin: '0',
            padding: '0',
            opacity: showFullQuote ? 1 : 0,
            height: showFullQuote ? 'auto' : '0',
            overflow: 'hidden',
            width: '100%',
            lineHeight: '1'
          }}>
            {quotes[currentQuoteIndex].citation}
          </div>
        </div>
      </div>

      {/* Main Content - all centered */}
      <div style={{ 
        maxWidth: '800px',
        width: '100%',
        margin: '20px auto 0',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        
        {/* Greek introduction text */}
        <div className="wow" style={{ 
          fontSize: '16px', 
          color: '#5d3a1a',
          marginBottom: '15px',
          fontStyle: 'italic',
          width: '100%',
          textAlign: 'center',
        }}>
          <div className="wow33">https://malakia.company</div><br />&nbsp;Οι Αρχαίοι Έλληνες χρησιμοποιούσαν τη λέξη <span style={{color:'red'}}>μαλακία</span> πολύ συχνά και, ακόμη συχνότερα, οι φιλόσοφοι, ρήτορες, ιστορικοί, θεατρικοί συγγραφείς και επιστήμονες, διότι τότε, όπως και σήμερα, υπήρχαν πολλοί μαλάκες. Σήμερα ο αριθμός τους έχει περάσει κάθε όριο και επιβάλλεται να σταματήσουμε να θεωρούμε τη λέξη ως μία χυδαία βρισιά και να τη χρησιμοποιούμε με την κοινωνική και πολιτική βαρύτητα που της αρμόζει. Παραθέτω μερικές παραπομπές σε κείμενα του <span className="ub">Αριστοτέλη</span>, του <span className="ub">Πλάτωνα</span>, του <span className="ub">Ισοκράτη</span>, του <span className="ub">Δημοσθένη</span>, του <span className="ub">Ηροδότου</span>, του <span className="ub">Θουκυδίδη</span> και του <span className="ub">Αριστοφάνη</span>, όπου εμφανίζεται η λέξη <span style={{color:'red'}}>μαλακία</span>.<br />&nbsp;

          <hr style={{ margin: '15px 0', border: 'none', borderTop: '5px solid #ccc' }} />

          <br />&nbsp;

          The Ancient Greeks used the word <span style={{color:'red'}}>μαλακία</span> very frequently and, even more frequently, philosophers, rhetoricians, historians, playwrights, and scientists did so, because then, just as today, there were many fools. Today their number has surpassed every limit, and we must stop treating the word as a vulgar insult and instead use it with the social and political weight that befits it. I cite several references in texts by <span className="ub">Aristotle</span>, <span className="ub">Plato</span>, <span className="ub">Isocrates</span>, <span className="ub">Demosthenes</span>, <span className="ub">Herodotus</span>, <span className="ub">Thucydides</span>, and <span className="ub">Aristophanes</span>, in which the word <span style={{color:'red'}}>μαλακία</span> appears.<br />&nbsp;
        </div>

        {/* Welcome section */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '30px',
          marginBottom: '10px',
          width: '100%'
        }}>
          <div>
            <div style={{ fontSize: '16px' }}>Καλώς ήλθατε</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              ΣΤΟΝ ΚΟΣΜΟ ΤΗΣ ΜΑΛΑΚΙΑΣ
            </div>
          </div>
          
          <span style={{ fontSize: '16px', color: '#999' }}>|</span>
          
          <div>
            <div style={{ fontSize: '16px' }}>Welcome to</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              THE WORLD OF CALLOUSNESS
            </div>
          </div>
        </div>

        <div style={{ fontSize: '16px', fontFamily: 'Georgia, serif', color: '#666', margin: '5px 0' }}>
          ΜΑΛΑΚΙΑ = CALLOUSNESS • ΜΑΛΑΚΑΣ = CALLOUS
        </div>
        
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#92400e', margin: '5px 0' }}>
          Η μαλακία (μαλθακότητα) είναι ελληνική λέξη, της οποίας το σημασιολογικό εύρος εκτείνεται σε όλες τις αποχρώσεις της ηθικής χαλαρότητας, από την πιο αθώα έως την πιο τερατώδη.
        </div>

        <div style={{ fontSize: '16px', color: '#92400e', margin: '5px 0' }}>
          Όταν το ηθικό θεμέλιο είναι μαλακό, δεν μπορεί να σηκώσει βάρος, και ο άνθρωπος βυθίζεται — σαν να στέκεται πάνω σε ένα τεράστιο, μισοφουσκωμένο μπαλόνι. <b>Αυτή είναι η μαλακία</b>.
        </div>

        <div style={{ fontSize: '16px', fontStyle: 'italic', color: '#92400e', margin: '5px 0' }}>
          Στη Νέα Ελληνική, ο όρος έχει επιπλέον αποκτήσει και τη σημασία του <span className="urd">αυνανισμού</span>, λόγω της σύνδεσής του με τη χαλάρωση (μαλάκωμα) του πέους.
        </div>

        <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #ccc' }} />

        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '5px 0' }}>
          Malakía (μαλακία/MALAKIA) is a Greek word whose semantic range 
          spans all shades of callousness, from the most innocent to the monstrous.
        </div>
        
        <div style={{ fontSize: '16px', color: '#666', margin: '5px 0' }}>
          Where the ethical foundation is soft, it cannot bear weight, and one sinks - like 
          standing on a huge, half-inflated balloon. <b>This is malakía.</b>
        </div>
        
        <div style={{ fontSize: '16px', fontStyle: 'italic', color: '#666', margin: '5px 0' }}>
          In Modern Greek, the term has additionally acquired the meaning of <span className="urd">masturbation</span>, by association with penile softness.
        </div>
      </div>
      
      {/* New alternating quote sections */}
      <div style={{ 
        maxWidth: '800px',
        width: '100%',
        margin: '30px auto 0',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        {/* First quote - brown background, beige font */}
        <div style={{
          backgroundColor: '#8B4513',
          color: '#F5F5DC',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          1 ... ἢ ἔρωτα ἤ τι λυπηρὸν οὐκ ἀνδρείου, ἀλλὰ μᾶλλον δειλοῦ: <span style={{ color: 'lime', fontWeight: 'bold' }}>μαλακία</span> γὰρ τὸ φεύγειν τὰ ἐπίπονα, καὶ οὐχ ὅτι καλὸν ...<br />... or love, or some painful thing, not (the mark) of a courageous man, but rather of a coward; for <span className="abc">malakia</span> is the fleeing of what is toilsome, and not because it is noble ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#F5F5DC', opacity: '0.9' }}>
            (Ἀριστοτέλης - Νικομάχεια Ἠθική - βιβλίο 7 • Aristotle - Nicomachean Ethics - book 7)
          </div>
        </div>

        {/* Second quote - beige background, brown font */}
        <div style={{
          backgroundColor: '#F5F5DC',
          color: '#8B4513',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          2 ... ἐν ἐξουσίᾳ μᾶλλον ὄντες ἢ ὅλως οἱ ἀδυνατώτεροι: πάντα γὰρ <span style={{ color: 'red', fontWeight: 'bold' }}>μαλακίας</span> σημεῖα. καὶ τὸ ὑφ᾽ ἑτέρου εὖ πάσχειν, καὶ τὸ ...<br />... being rather in a position of power than altogether among the weaker; for all these are signs of <span className="urd">malakia</span>. And both being treated well by another, and ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#8B4513', opacity: '0.9' }}>
            (Ἀριστοτέλης - Νικομάχεια Ἠθική - βιβλίο 7 • Aristotle - Nicomachean Ethics - book 7)
          </div>
        </div>

        {/* Third quote - brown background, beige font */}
        <div style={{
          backgroundColor: '#8B4513',
          color: '#F5F5DC',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          3 ... ἀφίστασθαι δὲ αὐτῶν διὰ τὰς ἡδονάς. ἀκολουθεῖ δὲ τῇ ἀκρασίᾳ <span style={{ color: 'lime', fontWeight: 'bold' }}>μαλακία</span> καὶ μεταμέλεια καὶ τὰ πλεῖστα ταὐτὰ ἃ καὶ τῇ ...<br />... but to withdraw from them because of pleasures. And <span className="abc">malakia</span> follows upon lack of self-control, as do regret and most of the same things that also follow upon ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#F5F5DC', opacity: '0.9' }}>
            (Ἀριστοτέλης - Νικομάχεια Ἠθική - βιβλίο 7 • Aristotle - Nicomachean Ethics - book 7)
          </div>
        </div>

        {/* Fourth quote - beige background, brown font */}
        <div style={{
          backgroundColor: '#F5F5DC',
          color: '#8B4513',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          4 ... εἶναι ὁπωσοῦν σωθῆναι ἢ τελευτῆσαι καλῶς. ἀκολουθεῖ δὲ τῇ δειλίᾳ <span style={{ color: 'red', fontWeight: 'bold' }}>μαλακία</span>, ἀνανδρία, ἀπονία, φιλοψυχία. ὕπεστι δέ τις εὐλάβεια καὶ τὸ ...<br />... to survive in any way whatsoever, rather than to die nobly. And accompanying cowardice are <span className="urd">malakia</span>, unmanliness, softness (or aversion to hardship), and love of life. And there is also present a certain caution and ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#8B4513', opacity: '0.9' }}>
            (Πολιτεία τοῦ Πλάτωνος - βιβλίο 3 • Plato's Republic - book 3)
          </div>
        </div>

        {/* Fifth quote - brown background, beige font */}
        <div style={{
          backgroundColor: '#8B4513',
          color: '#F5F5DC',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          5 ... ἁπάντων δὲ κρατεῖν ἐν τοῖς πολέμοις, τούτους διὰ ῥᾳθυμίαν ἢ <span style={{ color: 'lime', fontWeight: 'bold' }}>μαλακίαν</span> ἐγκαταλείπειν τά τε τῶν προγόνων ἔργα καὶ τὰ συμφέροντα ...<br />... and though they had the power to prevail over all in wars, these men, through slackness or <span className="abc">malakia</span>, abandon both the deeds of their ancestors and their own interests ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#F5F5DC', opacity: '0.9' }}>
            (Πανηγυρικός τοῦ Ἰσοκράτους - Isocrates' Panegyricus)
          </div>
        </div>

        {/* Sixth quote - beige background, brown font */}
        <div style={{
          backgroundColor: '#F5F5DC',
          color: '#8B4513',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          6 ... δὲ κατεγνώκασι μετὰ τούτων ἀδιήγητόν τινα τῆς πόλεως ἔκλυσιν καὶ <span style={{ color: 'red', fontWeight: 'bold' }}>μαλακίαν</span>, καὶ οὔτε πρόνοιαν περὶ τῶν μελλόντων εἶναι, οὔτε λογισμὸν ...<br />... and along with these they have condemned a certain indescribable dissolution and <span className="urd">malakia</span> of the city, and (they say that there is) neither foresight concerning what is to come, nor calculation ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#8B4513', opacity: '0.9' }}>
            (Ἀρεοπαγητικός τοῦ Ἰσοκράτους • Isocrates' Areopageticus)
          </div>
        </div>

        {/* Seventh quote - brown background, beige font */}
        <div style={{
          backgroundColor: '#8B4513',
          color: '#F5F5DC',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          7 ... ἀπαιτεῖς παρ᾽ ἐμοῦ, καὶ οὐκ αἰσχύνει τὸν αὐτὸν εἴς τε <span style={{ color: 'lime', fontWeight: 'bold' }}>μαλακίαν</span> σκώπτων καὶ τῆς Φιλίππου δυνάμεως ἀξιῶν ἕν᾽ ὄντα κρείττω ...<br />... you demand (this) from me, and you are not ashamed, while at the same time mocking the same man for <span className="abc">malakia</span> and expecting him, though only one person, to be stronger than Philip’s power ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#F5F5DC', opacity: '0.9' }}>
            (Περὶ τῶν ἐν Χερρονήσῳ τοῦ Δημοσθένους • Demosthenes' Chersonese)
          </div>
        </div>

        {/* Eighth quote - beige background, brown font */}
        <div style={{
          backgroundColor: '#F5F5DC',
          color: '#8B4513',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          8 ... μοι δοκοῦσιν ἐν ἅπασι τοῖς τόποις σαφῶς ἐπιδεδεῖχθαι τὴν αὑτῶν <span style={{ color: 'red', fontWeight: 'bold' }}>μαλακίαν</span>: καὶ γὰρ ἐν τῇ παραλίᾳ τῆς Ἀσίας πολλὰς μάχας ...<br />... they seem to me, in all places, clearly to have displayed their own <span className="urd">malakia</span>; for even on the coast of Asia they fought many battles ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#8B4513', opacity: '0.9' }}>
            (1ος Φιλιππικός τοῦ Δημοσθένους • Demosthenes' 1st Philippic)
          </div>
        </div>

        {/* Ninth quote - brown background, beige font */}
        <div style={{
          backgroundColor: '#8B4513',
          color: '#F5F5DC',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          9 ... τε δὲ ἔσεσθε ὑπερβαλόμενοι τοὺς ἐναντίους εἶναι ἐλεύθεροι: εἰ δὲ <span style={{ color: 'lime', fontWeight: 'bold' }}>μαλακίῃ</span> τε καὶ ἀταξίῃ διαχρήσησθε, οὐδεμίαν ὑμέων ἔχω ἐλπίδα μὴ ...<br />... and you will surpass your enemies and be free; but if you conduct yourselves with <span className="abc">malakia</span> and disorder, I have no hope for you that ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#F5F5DC', opacity: '0.9' }}>
            (Ἱστορίαι Ἡροδότου • Histories Book VII, chapter 9b)
          </div>
        </div>

        {/* Tenth quote - beige background, brown font */}
        <div style={{
          backgroundColor: '#F5F5DC',
          color: '#8B4513',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          10 ... ἐπηκολούθησαν δὲ διώκοντες Αἰθίοπες καὶ <span style={{ color: 'red', fontWeight: 'bold' }}>μαλακίας</span> ὑπολαβόντες τὸ μὴ κρατεῖν ἁπάσης τῆς Αἰγύπτου τῆς χώρας ...<br />... and the Ethiopians followed in pursuit, and, supposing it to be a sign of <span className="urd">malakia</span> not to be in control of the whole land of Egypt ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#8B4513', opacity: '0.9' }}>
            (Ἱστορίαι Ἡροδότου • Histories III.21)
          </div>
        </div>

        {/* Eleventh quote - brown background, beige font */}
        <div style={{
          backgroundColor: '#8B4513',
          color: '#F5F5DC',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          11 ... ἴσμεν ὅπως τάδε τριῶν τῶν μεγίστων ξυμφορῶν ἀπήλλακται, ἀξυνεσίας ἢ <span style={{ color: 'lime', fontWeight: 'bold' }}>μαλακίας</span> ἢ ἀμελείας. οὐ γὰρ δὴ πεφευγότες αὐτὰ ἐπὶ τὴν ...<br />... we know how he has been freed from these three greatest misfortunes: lack of understanding, or <span className="abc">malakia</span>, or negligence. For surely it is not by having escaped them that he has come to ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#F5F5DC', opacity: '0.9' }}>
            (Θουκυδίδης - Πελοποννησιακός Πόλεμος)
          </div>
        </div>

        {/* Twelfth quote - beige background, brown font */}
        <div style={{
          backgroundColor: '#F5F5DC',
          color: '#8B4513',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          12 ... φιλοκαλοῦμεν μετ᾽ εὐτελείας καὶ φιλοσοφοῦμεν ἄνευ <span style={{ color: 'red', fontWeight: 'bold' }}>μαλακίας</span> ...<br />... we cultivate refinement with simplicity, and we practice philosophy without <span className="urd">malakia</span> ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#8B4513', opacity: '0.9' }}>
            (Θουκυδίδης - Πελοποννησιακός Πόλεμος - Ἐπιτάφιος τοῦ Περικλέους • Pericles' Funeral Oration)
          </div>
        </div>

        {/* Thirteenth quote - brown background, beige font */}
        <div style={{
          backgroundColor: '#8B4513',
          color: '#F5F5DC',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          13 ... τὴν πόλιν ἐς <span style={{ color: 'lime', fontWeight: 'bold' }}>μαλακίαν</span> ἄγεις ...<br />… you are leading the city into <span className="abc">malakia</span> …
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#F5F5DC', opacity: '0.9' }}>
            (Ἱππεῖς τοῦ Ἀριστοφάνη • Aristophanes' Knights — leading the city into softness/political slackness)
          </div>
        </div>

        {/* Fourteenth quote - beige background, brown font */}
        <div style={{
          backgroundColor: '#F5F5DC',
          color: '#8B4513',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '8px',
          fontFamily: "'Gentium Plus', 'Palatino Linotype', 'Athena', 'Galatia SIL', Georgia, serif",
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          14 ... ἐν πολέμῳ <span style={{ color: 'red', fontWeight: 'bold' }}>μαλακίαν</span> ἐπιδείκνυσθε ...<br />... in war you were displaying <span className="urd">malakia</span> ...
          <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#8B4513', opacity: '0.9' }}>
            (Λυσιστράτη τοῦ Ἀριστοφάνη • Aristophanes' Lysistrata — showing softness in war, failure of martial firmness)
          </div>
        </div>
      </div>
      <p>&nbsp;</p><p>&nbsp;</p>
    </div>
  );
}