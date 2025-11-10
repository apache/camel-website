const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

/**
 * Generates toon format sitemaps from XML sitemaps.
 * Converts all sitemap*.xml files to toon format (.md files)
 * as per https://github.com/toon-format/toon specification.
 */
async function generateToonSitemaps() {
  const parser = new xml2js.Parser();
  const glob = require('glob');

  console.log('\nGenerating toon format sitemaps...');

  // Find all sitemap*.xml files in the public directory
  const sitemapFiles = glob.sync('public/sitemap*.xml');

  if (sitemapFiles.length === 0) {
    return;
  }

  for (const xmlPath of sitemapFiles) {
    const sitemapFile = path.basename(xmlPath);
    const toonPath = xmlPath.replace(/\.xml$/, '.md');

    try {
      // Read XML file
      const xmlContent = fs.readFileSync(xmlPath, 'utf8');

      // Parse XML to JavaScript object
      const result = await parser.parseStringPromise(xmlContent);

      let toonContent = '';

      // Check if it's a sitemap index or a urlset
      if (result.sitemapindex) {
        // This is a sitemap index (sitemap.xml)
        const sitemaps = result.sitemapindex.sitemap || [];
        toonContent = `sitemaps[${sitemaps.length}]{loc}:\n`;
        for (const sitemap of sitemaps) {
          let loc = sitemap.loc ? sitemap.loc[0] : '';
          // Convert .xml URLs to .md
          loc = loc.replace(/\.xml$/, '.md');
          toonContent += `  ${loc}\n`;
        }
      } else if (result.urlset) {
        // This is a regular sitemap with URLs
        const urls = result.urlset.url || [];
        toonContent = `urls[${urls.length}]{loc,lastmod}:\n`;
        for (const url of urls) {
          let loc = url.loc ? url.loc[0] : '';
          const lastmod = url.lastmod ? url.lastmod[0] : '';
          // Convert .html URLs to .md
          loc = loc.replace(/\.html$/, '.md');
          toonContent += `  ${loc},${lastmod}\n`;
        }
      }

      // Write toon format file
      fs.writeFileSync(toonPath, toonContent, 'utf8');
      console.log(`Generated ${sitemapFile.replace('.xml', '.md')}`);
    } catch (error) {
      console.error(`Error generating toon sitemap for ${sitemapFile}:`, error.message);
    }
  }

  console.log(`Toon format sitemaps generation complete - ${sitemapFiles.length} files converted`);
}

module.exports = {
  generateToonSitemaps
};
