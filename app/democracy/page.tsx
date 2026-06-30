// app/democracy/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import './styles.css';

export default function DemocracyPage() {
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
    <div className="democracyRoot" ref={rootRef}>
      <header className="masthead">
        <div className="wrap mastheadInner">
          <div className="wordmark">
            <b>ROTA</b> · A Civic Education Project
          </div>
          <nav className="nav">
            <a href="#argument">Argument</a>
            <a href="#precedent">Precedent</a>
            <a href="#rotation">How It Works</a>
            <a href="#fund">Support</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="eyebrow">An idea older than elections</div>
          <h1 className="thesis">Power, not permission.</h1>
          <p className="lede">
            There is no democracy where power is delegated to elected officials for years at a time — only governments that borrow the name. We're building the case for the real thing: government by rotation, where every citizen takes their turn, and no one holds power long enough for it to corrupt them.
          </p>
          <div className="heroMeta">
            <div>
              <strong>2 weeks</strong>on city council, per citizen, per year
            </div>
            <div>
              <strong>2 weeks</strong>in law enforcement, per citizen, per year
            </div>
            <div>
              <strong>2 weeks</strong>as judge or juror, per citizen, per year
            </div>
          </div>
        </div>
      </section>

      <section id="argument" className="section">
        <div className="wrap">
          <div className="sectionLabel">The Argument</div>
          <h2 className="sectionTitle">Why rotation, not election</h2>
          <p className="sectionIntro">
            Voting decides who governs you. It has never, by itself, meant you govern
            yourself. The case for rotation rests on five claims — each one a reason
            elections and self-rule aren&apos;t the same thing.
          </p>

          <div className="ledger reveal">
            <div className="ledgerRow">
              <div className="ledgerMark">Claim 1</div>
              <div>
                <h3>Permanent power and democracy are mutually exclusive.</h3>
                <p>
                  If someone holds power indefinitely — or even for a fixed multi-year term —
                  citizens aren&apos;t ruling. They&apos;re being ruled, with a review period
                  attached.
                </p>
              </div>
            </div>
            <div className="ledgerRow">
              <div className="ledgerMark">Claim 2</div>
              <div>
                <h3>Delegated power and democracy are mutually exclusive.</h3>
                <p>
                  The instant you hand your power to a representative, it stops being your
                  power in action. It becomes their judgment, exercised on your behalf —
                  which is a different thing.
                </p>
              </div>
            </div>
            <div className="ledgerRow">
              <div className="ledgerMark">Claim 3</div>
              <div>
                <h3>Voting selects rulers. It doesn&apos;t make citizens rulers.</h3>
                <p>
                  Choosing who governs you, periodically, is not the same exercise as
                  governing. One is a consumer choice. The other is the thing democracy is
                  supposed to mean.
                </p>
              </div>
            </div>
            <div className="ledgerRow">
              <div className="ledgerMark">Claim 4</div>
              <div>
                <h3>Short terms remove the time corruption needs.</h3>
                <p>
                  Patronage networks, donor relationships, and career incentives all need
                  time to form. Two weeks in office isn&apos;t long enough to build any of
                  them.
                </p>
              </div>
            </div>
            <div className="ledgerRow">
              <div className="ledgerMark">Claim 5</div>
              <div>
                <h3>Rotation is as decentralized as power gets.</h3>
                <p>
                  No standing class of decision-makers. No professional politicians. No
                  permanent incumbency. Power passes through everyone, then moves on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="precedent" className="section">
        <div className="wrap">
          <div className="sectionLabel">Not a New Idea</div>
          <h2 className="sectionTitle">This is how democracy began</h2>
          <div className="precedentGrid reveal">
            <div>
              <p>
                In classical Athens, most public offices weren&apos;t won by election — they
                were filled by lottery, drawn from the pool of eligible citizens. Election
                was viewed with suspicion, reserved mainly for the few roles requiring
                specialized skill, like generalship.
              </p>
              <p>
                The reasoning was direct: elections tend to favor the wealthy, the
                well-connected, and the persuasive. A lottery favors no one. It was
                considered the more democratic mechanism — selection by lot was, in a real
                sense, the original meaning of &quot;rule by the people.&quot;
              </p>
              <p>
                That tradition resurfaces today in citizens&apos; assemblies in Ireland and
                France, in sortition-based reform proposals worldwide, and in a growing body
                of political theory questioning whether elections were ever democracy&apos;s
                defining feature at all.
              </p>
            </div>
            <div className="quoteBlock">
              &quot;Demos kratos&quot; — the power of the people. Not the power to choose who
              rules. The power, itself, in the people&apos;s hands.
            </div>
          </div>
        </div>
      </section>

      <section id="rotation" className="section dialSection">
        <div className="wrap">
          <div className="sectionLabel">How It Works</div>
          <h2 className="sectionTitle">One citizen, three rotations, every year</h2>
          <p className="sectionIntro">
            Every adult citizen moves through the rotation in sequence — alphabetically, or
            by a transparent randomized order. No one is exempt by status. No one repeats
            early.
          </p>

          <div className="dialWrap reveal">
            <svg
              className="dialSvg"
              viewBox="0 0 320 320"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Diagram showing a citizen's year divided into three rotating civic duties and ordinary life"
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
                fill="#A13D2B"
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
                ONE
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
                CITIZEN
              </text>
            </svg>
            <div className="dialLegend">
              <div className="dialLegendItem">
                <div className="dialSwatch" style={{ background: '#DED4B9', border: '1px solid #C9BD9D' }} />
                <div>
                  <h4>Ordinary life — most of the year</h4>
                  <p>Work, family, rest. Civic duty is a rotation through the calendar, not a career.</p>
                </div>
              </div>
              <div className="dialLegendItem">
                <div className="dialSwatch" style={{ background: '#2C3A55' }} />
                <div>
                  <h4>City council — 2 weeks</h4>
                  <p>Local legislative and budget decisions, made by whoever&apos;s turn it is, not by whoever campaigned hardest.</p>
                </div>
              </div>
              <div className="dialLegendItem">
                <div className="dialSwatch" style={{ background: '#A13D2B' }} />
                <div>
                  <h4>Law enforcement — 2 weeks</h4>
                  <p>Community policing duties rotate the same way, under standardized training all citizens complete in advance.</p>
                </div>
              </div>
              <div className="dialLegendItem">
                <div className="dialSwatch" style={{ background: '#A9824E' }} />
                <div>
                  <h4>Judge or juror — 2 weeks</h4>
                  <p>Judicial duty rotates too — extending the jury principle already familiar in many legal systems today.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="questions" className="section">
        <div className="wrap">
          <div className="sectionLabel">Open Questions</div>
          <h2 className="sectionTitle">What this idea hasn&apos;t solved yet</h2>
          <p className="sectionIntro">
            We&apos;re not presenting this as a finished blueprint. A serious idea earns trust
            by naming its hardest problems, not hiding them.
          </p>
          <div className="questions reveal">
            <div className="qRow">
              <h4>How do untrained citizens handle technical roles like judging or policing?</h4>
              <p>
                Standardized, mandatory training ahead of each rotation is the working
                assumption — but the scope and rigor of that training is unresolved, and
                it&apos;s the single hardest design problem in this model.
              </p>
            </div>
            <div className="qRow">
              <h4>Does rotation scale beyond a city council to a national legislature?</h4>
              <p>
                Sortition has clear historical precedent at city scale. Scaling it to
                national governance — especially for matters requiring continuity, like
                foreign policy — is an open design question, not a solved one.
              </p>
            </div>
            <div className="qRow">
              <h4>What does the transition from the current system actually look like?</h4>
              <p>
                We don&apos;t have a transition plan yet. The first phase of this project is
                building public understanding of the idea — transition design comes after,
                and with more people involved in shaping it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="fund" className="section fund">
        <div className="wrap">
          <div className="sectionLabel">Support This Project</div>
          <h2 className="sectionTitle">We&apos;re funding the education, not a campaign</h2>
          <p className="sectionIntro">
            This isn&apos;t a candidate, a party, or a vote. It&apos;s an argument that needs
            to reach people clearly before it can go anywhere. Your contribution funds the
            first phase: building the case, in public, in the open.
          </p>

          <div className="fundBox reveal">
            <h3>What this funds</h3>
            <ul className="fundList">
              <li>A clear, well-sourced educational website explaining the rotation model and its historical roots</li>
              <li>Plain-language and visual explainers — including honest treatment of the open questions above</li>
              <li>Groundwork for local discussions and pilot citizens&apos; assemblies</li>
            </ul>
            {/* TODO: replace href with your real payment processor link (Stripe / Donorbox / Open Collective) */}
            <a href="#" className="ctaBtn">
              Contribute to the project
            </a>
            <p className="ctaNote">
              Donations are processed transparently — every contribution and expense is
              publicly visible. No funds support any candidate or party.
            </p>
          </div>
        </div>
      </section>

      <footer className="democracyFooter">
        <div className="wrap">
          <p>ROTA — A Civic Education Project · Not affiliated with any party or candidate</p>
        </div>
      </footer>
    </div>
  );
}
