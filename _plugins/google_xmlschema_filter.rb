# Custom Liquid filter to format dates for Google Sitemap (without colon in timezone)
module Jekyll
  module GoogleXmlschemaFilter
    def google_xmlschema(date)
      return "" if date.nil?

      # Convert to Time object if it's a string
      date = Time.parse(date.to_s) if date.is_a?(String)

      # Format: YYYY-MM-DDTHH:MM:SS+HHMM (without colon in timezone, no spaces)
      formatted = date.strftime("%Y-%m-%dT%H:%M:%S%z")

      # Remove any spaces that might have been added
      formatted.gsub(/\s+/, '')
    end
  end
end

Liquid::Template.register_filter(Jekyll::GoogleXmlschemaFilter)

