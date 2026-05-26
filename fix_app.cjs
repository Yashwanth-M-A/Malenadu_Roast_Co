const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

// Find the line with "Trust strip" comment (line 559, index 558)
let trustStripStart = -1;
let handlePrevLine = -1;
let currentImageLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Trust strip') && lines[i].includes('premium')) {
    trustStripStart = i;
  }
  if (lines[i].includes('const handlePrev') && trustStripStart > 0 && handlePrevLine < 0) {
    handlePrevLine = i;
  }
  if (lines[i].includes('const currentImage = product.images') && handlePrevLine > 0 && currentImageLine < 0) {
    currentImageLine = i;
  }
}

console.log('Trust strip start:', trustStripStart + 1);
console.log('handlePrev line:', handlePrevLine + 1);
console.log('currentImage line:', currentImageLine + 1);

if (trustStripStart < 0 || handlePrevLine < 0 || currentImageLine < 0) {
  console.error('Could not find all markers');
  process.exit(1);
}

const newTrustStripCode = `            {/* Trust strip \u2014 premium highlighted badges */}
            <motion.div
              className="hero-trust-strip"
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } } }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: '3rem',
                background: 'linear-gradient(135deg, rgba(12,10,8,0.75), rgba(22,18,12,0.65))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(232,202,128,0.35)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(200,147,90,0.18), inset 0 1px 0 rgba(232,202,128,0.15), 0 0 0 1px rgba(200,147,90,0.08)',
                position: 'relative',
              }}
            >
              {/* Subtle shimmer overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(105deg, transparent 40%, rgba(232,202,128,0.06) 50%, transparent 60%)',
                animation: 'trustShimmer 4s ease-in-out infinite',
              }} />
              {[
                { icon: <Star size={18} fill="#E8CA80" color="#E8CA80" />, text: '100+ Happy Customers' },
                { icon: <Truck size={18} color="#E8CA80" />, text: '2\u20134 Days Delivery' },
                { icon: <Leaf size={18} color="#E8CA80" />, text: 'Direct from Estates' },
              ].map((item, i, arr) => (
                <React.Fragment key={i}>
                  <span
                    className="hero-trust-item"
                    style={{
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0.9rem 1.4rem',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      zIndex: 1,
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  >
                    <span style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(232,202,128,0.12)',
                      border: '1px solid rgba(232,202,128,0.25)',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </span>
                    {item.text}
                  </span>
                  {i < arr.length - 1 && (
                    <span
                      className="hero-trust-divider"
                      style={{
                        width: '1px',
                        height: '28px',
                        background: 'linear-gradient(to bottom, transparent, rgba(232,202,128,0.4), transparent)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Falling beans overlay */}
      <DroppingBeans />
    </section>
  );
};

const ProductCard = ({ product, onBuyNow, hideBuyNow }) => {
  const [imgIndex, setImgIndex] = useState(0);

  const handleNext = () => {
    if (!product.images) return;
    setImgIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (!product.images) return;
    setImgIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const currentImage = product.images ? product.images[imgIndex] : product.image;`;

// Replace lines from trustStripStart through currentImageLine
const before = lines.slice(0, trustStripStart);
const after = lines.slice(currentImageLine + 1);
const newLines = [...before, ...newTrustStripCode.split('\n'), ...after];

fs.writeFileSync('src/App.jsx', newLines.join('\r\n'), 'utf8');
console.log('File fixed successfully!');
console.log('Old lines replaced:', trustStripStart + 1, 'to', currentImageLine + 1);
console.log('New file lines:', newLines.length);
