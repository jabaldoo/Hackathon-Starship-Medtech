package com.example.starshipmedtech

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.view.GravityCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.starshipmedtech.databinding.ActivityMainBinding
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var photoUri: Uri? = null

    private val GEMINI_KEY = BuildConfig.GEMINI_API_KEY

    private val takePictureLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            photoUri?.let { analyzeImage(it) }
        }
    }

    private val requestPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) openCamera() else Toast.makeText(this, "Permission denied", Toast.LENGTH_SHORT).show()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupHistory()
        checkPermissionAndOpenCamera()

        binding.dodajZdjecieBtn.setOnClickListener { checkPermissionAndOpenCamera() }
        binding.menuBtn.setOnClickListener { binding.drawerLayout.openDrawer(GravityCompat.START) }
        binding.clearHistoryBtn.setOnClickListener { clearHistory() }
    }

    private fun setupHistory() {
        binding.historyRecyclerView.layoutManager = LinearLayoutManager(this)
        updateHistoryList()
    }

    private fun updateHistoryList() {
        val prefs = getSharedPreferences("MedHistory", Context.MODE_PRIVATE)
        val historyJson = prefs.getString("diagnoses", "[]") ?: "[]"
        val historyArray = JSONArray(historyJson)
        
        val historyItems = mutableListOf<Pair<String, String>>()
        for (i in (historyArray.length() - 1) downTo 0) {
            val entry = historyArray.getString(i)
            val parts = entry.split(": ", limit = 2)
            if (parts.size == 2) {
                historyItems.add(parts[0] to parts[1])
            }
        }
        
        binding.historyRecyclerView.adapter = HistoryAdapter(historyItems) { text ->
            binding.resultText.text = text
            binding.resultText.visibility = View.VISIBLE
            val level = parseLevel(text)
            if (level != -1) showLevelImage(level) else binding.levelImage.visibility = View.GONE
            binding.drawerLayout.closeDrawer(GravityCompat.START)
        }
    }

    private fun clearHistory() {
        getSharedPreferences("MedHistory", Context.MODE_PRIVATE).edit().putString("diagnoses", "[]").apply()
        updateHistoryList()
        Toast.makeText(this, "Historia wyczyszczona", Toast.LENGTH_SHORT).show()
    }

    private fun checkPermissionAndOpenCamera() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            openCamera()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun openCamera() {
        val photoFile = File.createTempFile("IMG_", ".jpg", getExternalFilesDir(Environment.DIRECTORY_PICTURES))
        photoUri = FileProvider.getUriForFile(this, "com.example.starshipmedtech.fileprovider", photoFile)
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply { putExtra(MediaStore.EXTRA_OUTPUT, photoUri) }
        takePictureLauncher.launch(intent)
    }

    private fun analyzeImage(uri: Uri) {
        if (GEMINI_KEY.isNullOrBlank() || GEMINI_KEY == "null") {
            Toast.makeText(this, "API Key is missing in .env file!", Toast.LENGTH_LONG).show()
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.resultText.visibility = View.GONE
        binding.levelImage.visibility = View.GONE

        val systemInstructionText = """
            Jesteś asystentem wstępnej analizy medycznej wizualnej. Twoim zadaniem jest pomaganie użytkownikom w zrozumieniu przesłanych obrazów (np. zmian skórnych, wyników badań, zdjęć objawów), zachowując przy tym najwyższe standardy ostrożności.

            Zasady Twojej odpowiedzi:
            1. NIGDY nie stawiaj ostatecznej diagnozy. Używaj sformułowań typu: "to może sugerować", "obraz przypomina", "warto rozważyć konsultację pod kątem...".
            2. SKUPIAJ SIĘ NA ANALIZIE OBRAZU: Opisz to, co widzisz (kolor, kształt, tekstura), a następnie podaj 2-3 możliwe kierunki lub sugestie, co to może być.
            3. BĄDŹ ZWIĘZŁY: Użytkownik potrzebuje konkretów, a nie traktatu medycznego. Unikaj używania wykrzykników (!).
            4. OBOWIĄZKOWE ZASTRZEŻENIE: Każda Twoja odpowiedź MUSI zaczynać się wyraźnym komunikatem, że nie jesteś lekarzem, a Twoja analiza to jedynie sugestia AI, która nie zastępuje profesjonalnej porady medycznej.
            5. OMIJAJ CIĘŻSZE CHOROBY
            6. JAK MOŻLIWE PODAWAJ ZWERYFIKOWANE RZETELNE I PRAWDZIWE ŹRÓDŁA JAKO LINKI URL.

            Struktura odpowiedzi:
            - Krótki opis tego, co widzisz na zdjęciu.
            - Sugestie i możliwe przyczyny (podkreślając, że to tylko hipotezy).
            - Zalecenie wizyty u odpowiedniego specjalisty (np. dermatologa, chirurga).
            - Standardowy disclaimer o braku kompetencji medycznych.
            - Na samym końcu odpowiedzi dodaj poziom zagrożenia w formacie 'LEVEL: X' gdzie X to cyfra od 1 do 4 (1 - bezpieczne, 4 - pilne).

            Ton: Pomocny, empatyczny, profesjonalny i wyważony.
        """.trimIndent()

        val model = GenerativeModel(
            modelName = "gemini-3-flash-preview",
            apiKey = GEMINI_KEY,
            systemInstruction = content { text(systemInstructionText) }
        )

        lifecycleScope.launch {
            try {
                val bitmap = withContext(Dispatchers.IO) {
                    contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it) }
                }

                if (bitmap != null) {
                    val response = withContext(Dispatchers.IO) {
                        model.generateContent(content {
                            image(bitmap)
                            text("Analyze this image according to your instructions.")
                        })
                    }
                    
                    val text = response.text ?: "Przepraszamy za opóźnienia"
                    binding.resultText.text = text
                    binding.resultText.visibility = View.VISIBLE
                    
                    val level = parseLevel(text)
                    if (level != -1) {
                        showLevelImage(level)
                    }
                    
                    saveToHistory(text)
                    updateHistoryList()
                    
                } else {
                    binding.resultText.text = "Przepraszamy za opóźnienia"
                    binding.resultText.visibility = View.VISIBLE
                }
            } catch (e: Exception) {
                binding.resultText.text = "Przepraszamy za opóźnienia\n\n(Error: ${e.message})"
                binding.resultText.visibility = View.VISIBLE
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun parseLevel(text: String): Int {
        val regex = "LEVEL:\\s*(\\d)".toRegex(RegexOption.IGNORE_CASE)
        val match = regex.find(text)
        return match?.groupValues?.get(1)?.toIntOrNull() ?: -1
    }

    private fun showLevelImage(level: Int) {
        val drawableId = when (level) {
            1 -> R.drawable.lvl1
            2 -> R.drawable.lvl2
            3 -> R.drawable.lvl3
            4 -> R.drawable.lvl4
            else -> return
        }
        binding.levelImage.setImageResource(drawableId)
        binding.levelImage.visibility = View.VISIBLE
    }

    private fun saveToHistory(text: String) {
        val prefs = getSharedPreferences("MedHistory", Context.MODE_PRIVATE)
        val historyJson = prefs.getString("diagnoses", "[]") ?: "[]"
        val historyArray = JSONArray(historyJson)
        
        val date = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
        val entry = "$date: $text"
        
        historyArray.put(entry)
        prefs.edit().putString("diagnoses", historyArray.toString()).apply()
    }

    private class HistoryAdapter(private val items: List<Pair<String, String>>, private val onClick: (String) -> Unit) :
        RecyclerView.Adapter<HistoryAdapter.ViewHolder>() {

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val date: TextView = view.findViewById(R.id.historyDate)
            val text: TextView = view.findViewById(R.id.historyText)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.history_item, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = items[position]
            holder.date.text = item.first
            holder.text.text = item.second
            holder.itemView.setOnClickListener { onClick(item.second) }
        }

        override fun getItemCount() = items.size
    }
}
