// app/democracy/el/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import '../styles.css';

export default function DemocracyPageGreek() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.reveal');
    if (!els) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="democracyRoot" ref={rootRef} lang="el">
      <header className="masthead">
        <div className="wrap mastheadInner">
          <div className="wordmark">
            <b>ROTA</b> · Έργο Πολιτικής Παιδείας
          </div>
          <nav className="nav">
            <a href="#argument">Επιχείρημα</a>
            <a href="#precedent">Προηγούμενο</a>
            <a href="#rotation">Πώς Λειτουργεί</a>
            <a href="#fund">Υποστήριξη</a>
            <a href="/democracy">English</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="eyebrow">Μια ιδέα παλαιότερη από τις εκλογές</div>
          <h1 className="thesis">Εξουσία, όχι άδεια.</h1>
          <p className="lede">
            Οταν η εξουσία ανατίθεται σε άγνωστους μέσω εκλογών, δεν έχουμε δημοκρατία — έχουμε μόνο κυβερνήσεις που δανείζονται
            το όνομα <i>δημοκρατία</i>. Χτίζουμε την επιχειρηματολογία για την αληθινή δημοκρατία: 
            διακυβέρνηση με εκ περιτροπής συμμετοχή με αλφαβητική σειρά, όπου κάθε πολίτης αναλαμβάνει τις ευθύνες του, και κανείς δεν κρατά την εξουσία αρκετά καιρό ώστε να διαφθαρεί. Για παράγειγμα και ανάλογα με τα δημογραφικά: 
          </p>
          <div className="heroMeta">
            <div>
              <strong>2 εβδομάδες</strong>στο δημοτικό συμβούλιο, ανά πολίτη, ανά έτος
            </div>
            <div>
              <strong>2 εβδομάδες</strong>στην αστυνόμευση, ανά πολίτη, ανά έτος
            </div>
            <div>
              <strong>2 εβδομάδες</strong>ως δικαστής ή ένορκος, ανά πολίτη, ανά έτος
            </div>
          </div>
        </div>
      </section>

      <section id="argument" className="section">
        <div className="wrap">
          <div className="sectionLabel">Το Επιχείρημα</div>
          <h2 className="sectionTitle">Γιατί εκ περιτροπής, και όχι εκλογή</h2>
          <p className="sectionIntro">
            Η ψήφος αποφασίζει ποιός σας κυβερνά. Επειδή ψηφίζετε δεν σημαίνει 
            ότι κυβερνάτε τον εαυτό σας. Η εκ περιτροπής άσκηση εξουσίας 
            στηρίζεται σε πέντε ισχυρισμούς όπου φαίνεται καθαρά ότι 
            εκλογές και αυτοδιακυβέρνηση δεν είναι το ίδιο πράγμα.
          </p>

          <div className="ledger reveal">
            <div className="ledgerRow">
              <div className="ledgerMark">Ισχυρισμός 1</div>
              <div>
                <h3>Η μόνιμη εξουσία και η δημοκρατία δεν συνάδουν και αλληλοαποκλείονται.</h3>
                <p>
                  Αν κάποιος κρατά την εξουσία επ&apos; αόριστον — ή ακόμη και για
                  σταθερή πολυετή θητεία — οι πολίτες δεν κυβερνούν. Κυβερνώνται έως τις επόμενες εκλογές.
                </p>
              </div>
            </div>
            <div className="ledgerRow">
              <div className="ledgerMark">Ισχυρισμός 2</div>
              <div>
                <h3>Η ανάθεση εξουσίας και η δημοκρατία δεν συνάδουν και αλληλοαποκλείονται.</h3>
                <p>
                  Τη στιγμή που παραδίδετε την εξουσία σας σε άτομα που υποτίθεται ότι σας αντιπροσωπεύουν,
                  δεν ασκείτε πλέον εξουσία. Εχετε εξουσιοδοτήσει άλλους να ασκούν εξουσια, κάτι το οποίο είναι τελέιως διαφορετικό.
                </p>
              </div>
            </div>
            <div className="ledgerRow">
              <div className="ledgerMark">Ισχυρισμός 3</div>
              <div>
                <h3>Η ψήφος επιλέγει κυβερνήτες. Δεν κάνει τους πολίτες κυβερνήτες.</h3>
                <p>
                  Το να ψηφίζετε περιοδικά ποιός σας κυβερνά δεν είναι το ίδιο με το να ασκείτε εξουσία εσείς οι ίδιοι. 
                  Αλλο ψευδαίσθηση δημοκρατίας και άλλο αληθινή δημοκρατία.
                </p>
              </div>
            </div>
            <div className="ledgerRow">
              <div className="ledgerMark">Ισχυρισμός 4</div>
              <div>
                <h3>Οι σύντομες θητείες αφαιρούν τον χρόνο που απαιτείται για να ριζώσει η διαφθορά.</h3>
                <p>
                  Δίκτυα πελατειακών σχέσεων, σχέσεις με χορηγούς και κίνητρα
                  σταδιοδρομίας χρειάζονται όλα χρόνο για να σχηματιστούν. Δύο
                  εβδομάδες στην εξουσία δεν αρκούν για να χτιστεί κανένα από αυτά.
                </p>
              </div>
            </div>
            <div className="ledgerRow">
              <div className="ledgerMark">Ισχυρισμός 5</div>
              <div>
                <h3>Η εκ περιτροπής συμμετοχή είναι η πιο αποκεντρωμένη μορφή εξουσίας.</h3>
                <p>
                  Καμία μόνιμη τάξη υπευθύνων λήψης αποφάσεων. Κανείς επαγγελματίας
                  πολιτικός. Καμία μόνιμη παραμονή στην εξουσία. Η εξουσία περνά
                  μέσα από όλους, και προχωρά.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="precedent" className="section">
        <div className="wrap">
          <div className="sectionLabel">Η ιδέα δεν είναι νέα.</div>
          <h2 className="sectionTitle">Έτσι ξεκίνησε το όραμα της δημοκρατίας</h2>
          <div className="precedentGrid reveal">
            <div>
              <p>
                Στην κλασική Αθήνα, τα περισσότερα δημόσια αξιώματα δεν κερδίζονταν
                με εκλογή — αλλά με κλήρωση, από τη δεξαμενή των πολιτών με
                δικαίωμα συμμετοχής. Η εκλογή αντιμετωπιζόταν με καχυποψία,
                και λάμβανε χώρα κυρίως για τις λίγες θέσεις που απαιτούσαν εξειδικευμένη
                δεξιότητα, όπως η στρατηγία.
              </p>
              <p>
                Η λογική ήταν άμεση: οι εκλογές τείνουν να ευνοούν τους πλούσιους,
                τους καλά δισκτυομένους και τους επιτήδειους. Η κλήρωση δεν ευνοεί
                κανέναν. Εθεωρείτο ο πιο δημοκρατικός μηχανισμός — η επιλογή με
                κλήρο είχε σκοπό να ασκούν εξουσία οι πολίτες σε προσωπικό επίπεδο.
              </p>
              <p>
                Αυτή η παράδοση επανεμφανίζεται σήμερα στις πολιτειακές συνελεύσεις
                πολιτών στην Ιρλανδία και τη Γαλλία, σε προτάσεις μεταρρύθμισης
                βασισμένες στην κλήρωση παγκοσμίως, και σε ένα αυξανόμενο σώμα
                πολιτικής θεωρίας που αμφισβητεί αν οι εκλογές ήταν ποτέ το
                καθοριστικό χαρακτηριστικό της δημοκρατίας.
              </p>
            </div>
            <div className="quoteBlock">
              «Δήμος κράτος» — η εξουσία των πολιτών. Όχι η εξουσία να επιλέγεις
              ποιός κυβερνά. Η ίδια η εξουσία, στα χέρια των πολιτών.
            </div>
          </div>
        </div>
      </section>

      <section id="rotation" className="section dialSection">
        <div className="wrap">
          <div className="sectionLabel">Πώς Λειτουργεί</div>
          <h2 className="sectionTitle">Ένας πολίτης, τρεις εκ περιτροπής θητείες, κάθε χρόνο</h2>
          <p className="sectionIntro">
            Κάθε ενήλικος πολίτης περνά από τη σειρά διαδοχικά — με αλφαβητική σειρά. Κανείς δεν εξαιρείται λόγω θέσης. Κανείς δεν
            αναλαμβάνει την εξουσία πριν φθάσει η σειρά του.
          </p>

          <div className="dialWrap reveal">
            <svg
              className="dialSvg"
              viewBox="0 0 320 320"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Διάγραμμα που δείχνει τον χρόνο ενός πολίτη χωρισμένο σε τρεις εκ περιτροπής πολιτικές υποχρεώσεις και την καθημερινή ζωή"
            >
              <circle cx="160" cy="160" r="140" fill="none" stroke="#C9BD9D" strokeWidth="1" />
              <path
                d="M 160 160 L 160 20 A 140 140 0 0 1 281.2 90.1 Z"
                fill="#DED4B9"
                className="dialSeg"
              />
              <path
                d="M 160 160 L 281.2 90.1 A 140 140 0 0 1 296.3 188.9 Z"
                fill="#2C3A55"
                className="dialSeg"
              />
              <path
                d="M 160 160 L 296.3 188.9 A 140 140 0 0 1 235.6 283.0 Z"
                fill="#4A5D52"
                className="dialSeg"
              />
              <path
                d="M 160 160 L 235.6 283.0 A 140 140 0 0 1 160 20 Z"
                fill="#A9824E"
                className="dialSeg"
              />
              <circle cx="160" cy="160" r="46" fill="#E9E2CF" stroke="#C9BD9D" strokeWidth="1" />
              <text
                x="160"
                y="155"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="11"
                fill="#4B4E54"
                letterSpacing="0.5"
              >
                ΕΝΑΣ
              </text>
              <text
                x="160"
                y="172"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="11"
                fill="#4B4E54"
                letterSpacing="0.5"
              >
                ΠΟΛΙΤΗΣ
              </text>
            </svg>
            <div className="dialLegend">
              <div className="dialLegendItem">
                <div className="dialSwatch" style={{ background: '#DED4B9', border: '1px solid #C9BD9D' }} />
                <div>
                  <h4>Καθημερινή ζωή — το μεγαλύτερο μέρος του χρόνου</h4>
                  <p>Δουλειά, οικογένεια, ανάπαυση. Η πολιτική υποχρέωση δεν είναι καριέρα.</p>
                </div>
              </div>
              <div className="dialLegendItem">
                <div className="dialSwatch" style={{ background: '#2C3A55' }} />
                <div>
                  <h4>Δημοτικό συμβούλιο — 2 εβδομάδες</h4>
                  <p>Τοπικές νομοθετικές και δημοσιονομικές αποφάσεις, λαμβανόμενες από όποιον είναι η σειρά του, όχι από όποιον έκανε την πιο σκληρή εκστρατεία.</p>
                </div>
              </div>
              <div className="dialLegendItem">
                <div className="dialSwatch" style={{ background: '#4A5D52' }} />
                <div>
                  <h4>Αστυνόμευση — 2 εβδομάδες</h4>
                  <p>Τα καθήκοντα κοινοτικής αστυνόμευσης εναλλάσσονται με τον ίδιο τρόπο, υπό τυποποιημένη εκπαίδευση που ολοκληρώνουν εκ των προτέρων όλοι οι πολίτες.</p>
                </div>
              </div>
              <div className="dialLegendItem">
                <div className="dialSwatch" style={{ background: '#A9824E' }} />
                <div>
                  <h4>Δικαστής ή ένορκος — 2 εβδομάδες</h4>
                  <p>Και το δικαστικό καθήκον εναλλάσσεται — επεκτείνοντας την αρχή της ενορκίας που είναι ήδη γνωστή σε πολλά νομικά συστήματα σήμερα.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="questions" className="section">
        <div className="wrap">
          <div className="sectionLabel">Ανοιχτά Ερωτήματα</div>
          <h2 className="sectionTitle">Τί δεν έχει λύσει ακόμη αυτή η ιδέα</h2>
          <p className="sectionIntro">
            Δεν το παρουσιάζουμε αυτό ως ολοκληρωμένο σχέδιο. Μία σοβαρή ιδέα κερδίζει
            εμπιστοσύνη κατονομάζοντας τα δυσκολότερα προβλήματά της, όχι κρύβοντάς τα.
          </p>
          <div className="questions reveal">
            <div className="qRow">
              <h4>Πώς διαχειρίζονται οι μη εκπαιδευμένοι πολίτες τεχνικούς ρόλους όπως η δικαστική κρίση ή η αστυνόμευση;</h4>
              <p>
                Η υποχρεωτική, τυποποιημένη εκπαίδευση πριν από κάθε θητεία είναι η
                βασική υπόθεση εργασίας — όμως η έκταση και η αυστηρότητα αυτής της
                εκπαίδευσης παραμένει ανοιχτό ζήτημα, και είναι το πιο δύσκολο
                πρόβλημα σχεδιασμού σε αυτό το μοντέλο.
              </p>
            </div>
            <div className="qRow">
              <h4>Κλιμακώνεται η εκ περιτροπής συμμετοχή πέρα από ένα δημοτικό συμβούλιο σε ένα εθνικό κοινοβούλιο;</h4>
              <p>
                Η κλήρωση έχει σαφές ιστορικό προηγούμενο σε επίπεδο πόλης. Η
                κλιμάκωσή της σε εθνική διακυβέρνηση — ειδικά για ζητήματα που
                απαιτούν συνέχεια, όπως η εξωτερική πολιτική — είναι ανοιχτό ζήτημα
                σχεδιασμού, όχι λυμένο.
              </p>
            </div>
            <div className="qRow">
              <h4>Πώς μοιάζει στην πράξη η μετάβαση από το σημερινό σύστημα;</h4>
              <p>
                Δεν έχουμε ακόμη σχέδιο μετάβασης. Η πρώτη φάση αυτού του έργου είναι
                η οικοδόμηση δημόσιας κατανόησης της ιδέας — ο σχεδιασμός της
                μετάβασης έρχεται μετά, με περισσότερους ανθρώπους να συμμετέχουν
                στη διαμόρφωσή του.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="fund" className="section fund">
        <div className="wrap">
          <div className="sectionLabel">Υποστηρίξτε Αυτό το Έργο</div>
          <h2 className="sectionTitle">Χρηματοδοτούμε την παιδεία, όχι μια εκστρατεία</h2>
          <p className="sectionIntro">
            Αυτό δεν έχει να κάνει με υποψήφιους, κόμματα ή ψηφοφορία. Είναι ένα επιχείρημα που
            πρέπει να φτάσει καθαρά στον κόσμο πριν προχωρήσει οπουδήποτε. Η
            συνεισφορά σας χρηματοδοτεί την πρώτη φάση: την οικοδόμηση της
            επιχειρηματολογίας, δημόσια, ανοιχτά.
          </p>

          <div className="fundBox reveal">
            <h3>Τι χρηματοδοτείτε</h3>
            <ul className="fundList">
              <li>Έναν σαφή, τεκμηριωμένο εκπαιδευτικό ιστότοπο που εξηγεί το μοντέλο εκ περιτροπής συμμετοχής και τις ιστορικές του ρίζες</li>
              <li>Επεξηγήσεις σε απλή γλώσσα και οπτικό υλικό — συμπεριλαμβανομένης ειλικρινούς αντιμετώπισης των ανοιχτών ερωτημάτων παραπάνω</li>
              <li>Τη θεμελίωση για τοπικές συζητήσεις και πιλοτικές συνελεύσεις πολιτών</li>
            </ul>
            {/* TODO: replace href with your real payment processor link (Stripe / Donorbox / Open Collective) */}
            <a href="#" className="ctaBtn">
              Συνεισφέρετε στο έργο
            </a>
            <p className="ctaNote">
              Οι δωρεές επεξεργάζονται με διαφάνεια — κάθε συνεισφορά και δαπάνη
              είναι δημόσια ορατή. Κανένα κονδύλιο δεν υποστηρίζει υποψήφιο ή κόμμα.
            </p>
          </div>
        </div>
      </section>

      <footer className="democracyFooter">
        <div className="wrap">
          <p>ROTA — Έργο Πολιτικής Παιδείας · Χωρίς διαδικτύωση με κόμμα ή υποψήφιο</p>
        </div>
      </footer>
    </div>
  );
}
